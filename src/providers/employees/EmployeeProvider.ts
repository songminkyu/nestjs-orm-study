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
