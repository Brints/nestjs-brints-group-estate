import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Upload } from '../upload.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadToAwsProvider } from './upload-to-aws.provider';
import { AppConfigService } from 'src/config/config.service';
import { CustomException } from 'src/exceptions/custom.exception';
import { UploadFile } from '../interface/upload-file.interface';
import { FileTypes } from '../enums/file-types.enum';

@Injectable()
export class UploadsService {
  constructor(
    private readonly uploadToAwsProvider: UploadToAwsProvider,

    private readonly appConfigService: AppConfigService,

    @InjectRepository(Upload)
    private readonly uploadsRepository: Repository<Upload>,
  ) {}

  public async uploadFile(file: Express.Multer.File) {
    if (
      ![
        'image/gif',
        'image/svg',
        'image/png',
        'image/jpg',
        'image/jpeg',
      ].includes(file.mimetype)
    ) {
      throw new CustomException(HttpStatus.BAD_REQUEST, 'Invalid File');
    }

    try {
      const name = await this.uploadToAwsProvider.fileUpload(file);

      const uploadFile: UploadFile = {
        file_name: name,
        file_path: `https://${this.appConfigService.getConfig().aws.aws_cloudfront_url}/${name}`,
        file_type: FileTypes.IMAGE,
        file_mime: file.mimetype,
        file_size: file.size,
      };

      const upload = this.uploadsRepository.create(uploadFile);

      return await this.uploadsRepository.save(upload);
    } catch (error: any) {
      throw new CustomException(HttpStatus.CONFLICT, error.message);
    }
  }
}
