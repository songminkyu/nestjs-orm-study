import { Prisma, PrismaClient } from "@prisma/client";
import { NotFoundException, Injectable } from "@nestjs/common"
import { IEmployee } from "@ORGANIZATION/PROJECT-api/lib/structures/employees/IEmployee"

export namespace EmployeeProvider {
    export namespace json {
        export const transform = (
            input: Prisma.employeeGetPayload<ReturnType<typeof select>>,
        ): IEmployee => ({
            emp_no: input.emp_no,
            birth_date: input.birth_date.toISOString(),
            first_name: input.first_name,
            last_name: input.last_name,
            gender: input.gender,
            hire_date:input.hire_date.toISOString()
        });
        export const select = () =>
            Prisma.validator<Prisma.employeeFindManyArgs>()({});
    }

    export const collect = (input: IEmployee) =>
        Prisma.validator<Prisma.employeeCreateInput>()({
            birth_date: input.birth_date,
            first_name: input.first_name,
            last_name: input.last_name,
            gender: input.gender,
            hire_date:input.hire_date
        });

}
@Injectable()
export class EmployeeService {
    private prisma: PrismaClient;
    constructor() {
        this.prisma = new PrismaClient()
    }

    async readEmployee() {
        const employeeData = await this.prisma.employee.findFirst(
            EmployeeProvider.json.select()
        );
        const plArr : any = ["song",'min', 'kyu']
        for(let idx = 0; idx < plArr.length; idx++)
        {
            const content: string = plArr[idx];
            console.log(`${content} : ${idx}`);
        }
        if (!employeeData) {
            throw new NotFoundException('employee data not found');
        }

        return EmployeeProvider.json.transform(employeeData);
    }
    async readAllEmployee(){
        const employeeData = await this.prisma.employee.findMany(
            EmployeeProvider.json.select()
        );
        if (!employeeData || employeeData.length === 0) {
            throw new NotFoundException('employee data not found');
        }

        return employeeData.map(employee => EmployeeProvider.json.transform(employee));
    }
    async readEmployeeByEmpNo(emp_no: number) {

        const employeeData = await this.prisma.employee.findUnique({
            where: {
                emp_no: emp_no
            },
            ...EmployeeProvider.json.select()
        });

        if (!employeeData) {
            throw new NotFoundException(`Employee with emp_no ${emp_no} not found`);
        }

        return EmployeeProvider.json.transform(employeeData);
    }
    async readEmployeeWithDepartmentHistory(emp_no: number): Promise<IEmployee> {
        const employeeData = await this.prisma.employee.findUnique({
            where: {
                emp_no: emp_no
            },
            include: {
                department_employees: true,
            },
            ...EmployeeProvider.json.select()
        });

        if (!employeeData) {
            throw new NotFoundException(`Employee with emp_no ${emp_no} not found`);
        }

        // Date 객체를 string으로 변환하여 IEmployee 타입에 맞게 조정
        return {
            emp_no: employeeData.emp_no,
            birth_date: employeeData.birth_date.toISOString().split('T')[0],
            first_name: employeeData.first_name,
            last_name: employeeData.last_name,
            gender: employeeData.gender,
            hire_date: employeeData.hire_date.toISOString().split('T')[0],
            department_employees: employeeData.department_employees.map(de => ({
                emp_no: de.emp_no,
                dept_no: de.dept_no,
                from_date: de.from_date.toISOString().split('T')[0],
                to_date: de.to_date.toISOString().split('T')[0]
            }))
        };
    }
    async readFuncRawEmployeeWithDepartmentHistory(emp_no: number): Promise<IEmployee> {
        try {
            // Call the PostgreSQL function using $queryRaw
            const results = await this.prisma.$queryRaw`
            SELECT * FROM get_employee_with_department_history(${emp_no}::integer)
            `;

            // Check if any results were returned
            if (!results || (Array.isArray(results) && results.length === 0)) {
                throw new NotFoundException(`Employee with emp_no ${emp_no} not found`);
            }

            const resultArray = Array.isArray(results) ? results : [results];
            // Extract employee information from the first row
            const firstRow = resultArray[0];

            // Create base employee object
            const employee: IEmployee = {
                emp_no: firstRow.emp_no,
                birth_date: firstRow.birth_date.toISOString().split('T')[0],
                first_name: firstRow.first_name,
                last_name: firstRow.last_name,
                gender: firstRow.gender,
                hire_date: firstRow.hire_date.toISOString().split('T')[0],
                department_employees: []
            };

            // Extract department history from all rows
            employee.department_employees = resultArray
                .filter(row => row.dept_emp_emp_no !== null) // Skip if no department history
                .map(row => ({
                    emp_no: row.dept_emp_emp_no,
                    dept_no: row.dept_emp_dept_no,
                    from_date: row.dept_emp_from_date.toISOString().split('T')[0],
                    to_date: row.dept_emp_to_date.toISOString().split('T')[0]
                }));

            return employee;
        } catch (error) {
            console.error('Error in readEmployeeWithDepartmentHistory:', error);

            // Exception handling
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error instanceof Error) {
                throw new Error(`Failed to retrieve employee with department history: ${error.message}`);
            } else {
                throw new Error('Failed to retrieve employee with department history: Unknown error');
            }
        }
    }
    async readProcRawEmployeeByEmpNo(emp_no: number) {
        try {
            // 1. 입력값 유효성 검사 강화
            if (!Number.isInteger(emp_no) || emp_no <= 0) {
                throw new Error('유효하지 않은 사원 번호 형식입니다');
            }

            // 2. 트랜잭션 내부에서 모든 작업 처리
            return await this.prisma.$transaction(async (tx) => {
                // 3. 임시 테이블 생성 (트랜잭션 종료 시 자동 삭제)
                await tx.$executeRaw`
                CREATE TEMP TABLE temp_employee_proc_result (
                    emp_no INTEGER PRIMARY KEY,
                    first_name VARCHAR(255) NOT NULL,
                    last_name VARCHAR(255) NOT NULL,
                    birth_date DATE NOT NULL,
                    gender CHAR(1) CHECK (gender IN ('M', 'F')),
                    hire_date DATE NOT NULL
                ) ON COMMIT DROP;
            `;

                // 4. 세션 변수 설정 (독립 실행)
                await tx.$executeRaw`SELECT set_config('app.emp_no', ${emp_no}::text, true)`;

                // 5. 프로시저 실행 (Unsafe로 분리 실행)
                await tx.$executeRawUnsafe(`
                DO $$
                DECLARE
                    v_emp_no INTEGER;
                    v_first_name VARCHAR;
                    v_last_name VARCHAR;
                    v_birth_date DATE;
                    v_gender CHAR(1);
                    v_hire_date DATE;
                BEGIN
                    -- 세션 변수에서 값 추출
                    PERFORM set_config('app.emp_no', current_setting('app.emp_no'), true);
                    
                    -- 프로시저 실행
                    CALL get_proc_employee_by_id(
                        current_setting('app.emp_no')::INTEGER,
                        v_emp_no, v_first_name, v_last_name, 
                        v_birth_date, v_gender, v_hire_date
                    );
                    
                    -- 임시 테이블에 결과 저장
                    INSERT INTO temp_employee_proc_result 
                    VALUES (
                        v_emp_no, 
                        v_first_name, 
                        v_last_name, 
                        v_birth_date, 
                        v_gender, 
                        v_hire_date
                    );
                END $$;
            `);

                // 6. 결과 조회
                const result = await tx.$queryRaw`
                    SELECT * FROM temp_employee_proc_result
                    WHERE emp_no = ${emp_no}::INTEGER
                LIMIT 1;
                `;

                // 7. 결과 검증
                if (!result || (Array.isArray(result) && result.length === 0)) {
                    throw new NotFoundException(
                        `사원 번호 ${emp_no}에 해당하는 정보가 없습니다`
                    );
                }

                // 8. 결과 변환
                const employeeData = Array.isArray(result) ? result[0] : result;
                return {
                    emp_no: Number(employeeData.emp_no),
                    first_name: employeeData.first_name.toString(),
                    last_name: employeeData.last_name.toString(),
                    birth_date: new Date(employeeData.birth_date)
                        .toISOString().split('T')[0],
                    gender: employeeData.gender.toString(),
                    hire_date: new Date(employeeData.hire_date)
                        .toISOString().split('T')[0]
                };
            });

        } catch (error) {
            // 9. 오류 처리
            if (error instanceof NotFoundException) throw error;
            const message = error instanceof Error ? error.message : '알 수 없는 오류';
            throw new Error(`사원 정보 조회 실패: ${message}`);
        }
    }
    async readFuncRawEmployeeByEmpNo(emp_no: number): Promise<IEmployee> {
        try {
            // Call the PostgreSQL function using Prisma's $queryRaw with explicit type casting
            const result = await this.prisma.$queryRaw`
                SELECT * FROM get_employee_by_id(${emp_no}::integer)
            `;

            // Check if any results were returned
            if (!result || (Array.isArray(result) && result.length === 0)) {
                throw new NotFoundException(`Employee with emp_no ${emp_no} not found`);
            }

            // Extract the employee data from the result
            const employeeData = Array.isArray(result) ? result[0] : result;

            // Transform the data to match IEmployee interface
            return {
                emp_no: employeeData.emp_no,
                birth_date: new Date(employeeData.birth_date).toISOString().split('T')[0],
                first_name: employeeData.first_name,
                last_name: employeeData.last_name,
                gender: employeeData.gender,
                hire_date: new Date(employeeData.hire_date).toISOString().split('T')[0]
            };
        } catch (error) {
            // Exception handling
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error instanceof Error) {
                throw new Error(`Failed to call function: ${error.message}`);
            } else {
                throw new Error('Failed to call function: Unknown error');
            }
        }
    }
    async createEmployee(data: IEmployee){
        // Transform the input data using EmployeeProvider.collect
        const createData = EmployeeProvider.collect(data);

        // Insert the data into the database
        const createdEmployee = await this.prisma.employee.create({
            data: createData
        });

        // Transform and return the created data
        return EmployeeProvider.json.transform(createdEmployee);
    }

}
