import core from "@nestia/core";
import { Controller, UploadedFile ,UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileInterceptor , FilesInterceptor} from "@nestjs/platform-express";
import { FileService } from "../../providers/upload/FileUploadProvider";

@Controller('file')
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @UseInterceptors(FileInterceptor('file'))
    @core.TypedRoute.Post('upload/single')
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        console.log(file);
        //http://localhost:37001/file/upload/single
        //post에서 body 설정후 key값에는 file 이란 명칭 명시, value값은 실제파일 업로드 후 전송
        return this.fileService.fileSingleUpload(file);
    }

    @UseInterceptors(FilesInterceptor('files', 10))
    @core.TypedRoute.Post('upload/multi')
    uploadMultiFiles(
        @UploadedFiles() files: Express.Multer.File[]
    ) {
        //http://localhost:37001/file/upload/multi
        return this.fileService.fileMultiUpload(files);
    }
}

