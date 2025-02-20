import { Module } from "@nestjs/common";

import {KreamsellerInfoController} from "./KreamsellerInfoController";

@Module({
    controllers: [
        KreamsellerInfoController,
    ],
})
export class KreamSellerModule {}
