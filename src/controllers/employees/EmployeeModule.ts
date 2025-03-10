import { Module } from "@nestjs/common";

import {EmployeeinfoController} from "./EmployeeinfoController";

@Module({
    controllers: [
        EmployeeinfoController,
    ],
})
export class EmployeeModule {}
