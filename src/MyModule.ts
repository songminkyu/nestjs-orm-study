import { Module } from "@nestjs/common";

import { MonitorModule } from "./controllers/monitors/MonitorModule";
import { KreamSellerModule } from "./controllers/kreamseller/KreamSellerModule";

@Module({
  imports: [MonitorModule,KreamSellerModule],
})
export class MyModule {}
