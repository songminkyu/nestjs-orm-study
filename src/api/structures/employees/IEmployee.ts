import {IDepartmentEmployee} from "@ORGANIZATION/PROJECT-api/lib/structures/employees/IDepartmentEmployee";

export interface IEmployee {
    emp_no: number;
    birth_date: string;
    first_name: string;
    last_name: string;
    gender: string;
    hire_date: string;
    department_employees?: IDepartmentEmployee[];
}