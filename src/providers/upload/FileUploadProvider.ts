import {Injectable} from "@nestjs/common";
import { BadRequestException } from "@nestjs/common";
@Injectable()
export class FileService {
    constructor() {}

    fileSingleUpload(file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException();
        }
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
                filepath: file.path,
                size: file.size
            };

        } catch (error) {
            console.error("Error processing upload:", error);
            return { success: false, message: 'Error processing file upload' };
        }
    }

    fileMultiUpload(files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }

        try {
            console.log("Files received:", files);

            interface FileInfo {
                filename: string;
                filepath: string;
                size: number;
                mimetype: string;
            }

            const result: {
                success: boolean;
                message: string;
                files: FileInfo[];
            } = {
                success: true,
                message: 'Files uploaded successfully',
                files: []
            };

            // Process all files in the array
            files.forEach(file => {
                result.files.push({
                    filename: file.originalname,
                    filepath: file.path,
                    size: file.size,
                    mimetype: file.mimetype
                });
            });

            return result;

        } catch (error) {
            console.error("Error processing uploads:", error);
            return { success: false, message: 'Error processing file uploads' };
        }
    }
}
