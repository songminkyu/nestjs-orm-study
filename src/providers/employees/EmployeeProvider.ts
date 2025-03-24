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

    async readProcEmployeeByEmpNo(emp_no: number) {
        try {
            // Create a temporary table to store procedure results
            await this.prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS temp_employee_proc_result (
                    emp_no INTEGER,
                    first_name VARCHAR(255),
                    last_name VARCHAR(255),
                    birth_date DATE,
                    gender CHAR(1),
                    hire_date DATE
                );
            `;

            // Execute the procedure and store results in the temporary table
            await this.prisma.$executeRawUnsafe(`
            DO $$
            DECLARE
                v_emp_no INTEGER;
                v_first_name VARCHAR;
                v_last_name VARCHAR;
                v_birth_date DATE;
                v_gender CHAR(1);
                v_hire_date DATE;
            BEGIN
                CALL get_proc_employee_by_id(${emp_no}, v_emp_no, v_first_name, v_last_name, v_birth_date, v_gender, v_hire_date);
                
                INSERT INTO temp_employee_proc_result 
                VALUES (v_emp_no, v_first_name, v_last_name, v_birth_date, v_gender, v_hire_date);
            END $$;`);

            // Query the results from the temporary table
            const [result] = await Promise.all([this.prisma.$queryRaw`
                SELECT * FROM temp_employee_proc_result;
            `]);

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
            // 예외 처리
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error instanceof Error) {
                throw new Error(`Failed to call procedure: ${error.message}`);
            } else {
                throw new Error('Failed to call procedure: Unknown error');
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
