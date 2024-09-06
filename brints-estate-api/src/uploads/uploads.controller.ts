import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileInterceptor /*, FilesInterceptor */,
} from '@nestjs/platform-express';
import { ApiHeaders, ApiOperation } from '@nestjs/swagger';
import { UploadsService } from './providers/uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  @ApiHeaders([
    { name: 'Content-Type', description: 'multipart/form-data' },
    { name: 'Authorization', description: 'Bearer Token' },
  ])
  @ApiOperation({
    summary: 'Upload a new image to the server',
  })
  @Post('file')
  public async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const payload = await this.uploadsService.uploadFile(file);
    return {
      message: 'Image successfully uploaded to server',
      status_code: HttpStatus.OK,
      payload,
    };
  }
}
