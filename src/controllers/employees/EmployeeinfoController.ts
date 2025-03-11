import core from "@nestia/core";
import {Controller, UploadedFile, UseInterceptors} from "@nestjs/common";

import { IEmployee } from "@ORGANIZATION/PROJECT-api/lib/structures/employees/IEmployee";

import { EmployeeService } from "../../providers/employees/EmployeeProvider";
import {FileInterceptor} from "@nestjs/platform-express";
import { Express } from 'express';
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
  @core.TypedRoute.Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(@UploadedFile() file: Express.Multer.File) {
    //http://localhost:37001/emp/employeeinfo/upload
    //post에서 body 설정후 key값에는 file 이란 명칭 명시, value값은 실제파일 업로드 후 전송
    try {
      console.log("File received:", file);

      if (!file) {
        console.error("No file received");
        return { success: false, message: 'No file received' };
      }

      // Process file as needed
      // e.g., this.employee.processUploadedFile(file);

      return {
        success: true,
        message: 'File uploaded successfully',
        filename: file.originalname,
        size: file.size
      };
    } catch (error) {
      console.error("Error processing upload:", error);
      return { success: false, message: 'Error processing file upload' };
    }
  }
}