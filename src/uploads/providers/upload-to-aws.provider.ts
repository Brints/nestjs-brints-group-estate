import * as path from 'node:path';
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid4 } from 'uuid';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class UploadToAwsProvider {
  constructor(private readonly appConfigService: AppConfigService) {}

  public async fileUpload(file: Express.Multer.File): Promise<string> {
    const s3Client = new S3Client({
      region: this.appConfigService.getConfig().aws.aws_region,
      credentials: {
        accessKeyId: this.appConfigService.getConfig().aws.aws_access_key_id,
        secretAccessKey:
          this.appConfigService.getConfig().aws.aws_secret_access_key,
      },
    });

    try {
      const fileName = this.generateFileName(file);
      const params = {
        Bucket: this.appConfigService.getConfig().aws.aws_bucket_name,
        Body: file.buffer,
        Key: fileName,
        ContentType: file.mimetype,
      };

      await s3Client.send(new PutObjectCommand(params));
      return fileName;
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
  }

  private generateFileName(file: Express.Multer.File) {
    // extract file name
    const fileName = file.originalname.split('.')[0];

    // remove white spaces
    fileName.replace(/\s/g, '').trim();

    // extract extension
    const extension = path.extname(file.originalname);

    // generate timestamp
    const timestamp = new Date().getTime().toString().trim();

    return `${fileName}-${timestamp}-${uuid4()}${extension}`;
  }
}
