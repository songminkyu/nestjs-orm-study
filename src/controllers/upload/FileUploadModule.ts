import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import {FileController} from "./FileUploadController";
import {FileService} from "../../providers/upload/FileUploadProvider";
import {MulterUtil} from "../../utils/MulterUtil";

@Module({
    imports: [
        MulterModule.registerAsync({
            useClass: MulterUtil,
        }),
    ],
    controllers: [FileController],
    providers: [FileService],
})
export class FileUploadModule {}