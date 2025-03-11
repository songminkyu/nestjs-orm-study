import { Module } from "@nestjs/common";

import { MonitorModule } from "./controllers/monitors/MonitorModule";
import { KreamSellerModule } from "./controllers/kreamseller/KreamSellerModule";
import {EmployeeModule} from "./controllers/employees/EmployeeModule";
import {FileUploadModule} from "./controllers/upload/FileUploadModule";

@Module({
  imports: [
    MonitorModule,
    KreamSellerModule,
    EmployeeModule,
    FileUploadModule
  ],
})
export class MyModule {}
