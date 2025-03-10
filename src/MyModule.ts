import { Module } from "@nestjs/common";

import { MonitorModule } from "./controllers/monitors/MonitorModule";
import { KreamSellerModule } from "./controllers/kreamseller/KreamSellerModule";
import {EmployeeModule} from "./controllers/employees/EmployeeModule";

@Module({
  imports: [MonitorModule,KreamSellerModule,EmployeeModule],
})
export class MyModule {}
