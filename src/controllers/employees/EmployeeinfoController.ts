import core from "@nestia/core";
import { Controller } from "@nestjs/common";
import { IEmployee } from "@ORGANIZATION/PROJECT-api/lib/structures/employees/IEmployee";
import { EmployeeService } from "../../providers/employees/EmployeeProvider";

@Controller("emp/employeeinfo")
export class EmployeeinfoController {
  private employee: EmployeeService;
  constructor() {
    this.employee = new EmployeeService();
  }

  @core.TypedRoute.Get("/first")
  public async get_first(): Promise<IEmployee> {
      return await this.employee.readEmployee();
  }
  @core.TypedRoute.Get("/all")
  public async get_all(): Promise<IEmployee[]> {
    return await this.employee.readAllEmployee();
  }
  @core.TypedRoute.Get("/:emp_no")
  public async get_employee_by_emp_no(@core.TypedParam("emp_no") emp_no: number): Promise<IEmployee> {
    return await this.employee.readEmployeeByEmpNo(emp_no);
  }
  @core.TypedRoute.Get("/withdepartment/:emp_no")
  public async get_employee_with_department(@core.TypedParam("emp_no") emp_no: number): Promise<IEmployee> {
    return await this.employee.readEmployeeWithDepartmentHistory(emp_no);
  }
  @core.TypedRoute.Get("/proc/:emp_no")
  public async get_proc_employee_by_emp_no(@core.TypedParam("emp_no") emp_no: number): Promise<IEmployee> {
    return await this.employee.readProcEmployeeByEmpNo(emp_no);
  }
}