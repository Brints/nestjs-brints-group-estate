import * as path from 'node:path';
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { v4 as uuid4 } from 'uuid';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class UploadToAwsProvider {
  constructor(private readonly appConfigService: AppConfigService) {}

  public async fileUpload(file: Express.Multer.File) {
    const s3 = new S3();

    try {
      const uploadResult = await s3
        .upload({
          Bucket: this.appConfigService.getConfig().aws.aws_bucket_name,
          Body: file.buffer,
          Key: this.generateFileName(file),
          ContentType: file.mimetype,
        })
        .promise();

      return uploadResult.Key;
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
