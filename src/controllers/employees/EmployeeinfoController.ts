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
  public async get(): Promise<IEmployee> {
      return await this.employee.readEmployee();
  }
  @core.TypedRoute.Get("/all")
  public async get_all(): Promise<IEmployee[]> {
    return await this.employee.readAllEmployee();
  }
}