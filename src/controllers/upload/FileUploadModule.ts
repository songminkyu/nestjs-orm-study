import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import {MulterConfigService} from "../../utils/MulterConfig";
import {FileController} from "./FileUploadController";
import {FileService} from "../../providers/upload/FileUploadProvider";

@Module({
    imports: [
        MulterModule.registerAsync({
            useClass: MulterConfigService,
        }),
    ],
    controllers: [FileController],
    providers: [FileService],
})
export class FileUploadModule {}