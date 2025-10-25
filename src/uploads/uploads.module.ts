import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './providers/uploads.service';
import { UploadToAwsProvider } from './providers/upload-to-aws.provider';
import { UploadToCloudinaryProvider } from './providers/upload-to-cloudinary.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Upload } from './upload.entity';
import { AppConfigService } from 'src/config/config.service';

@Module({
  controllers: [UploadsController],
  providers: [
    UploadsService,
    UploadToAwsProvider,
    UploadToCloudinaryProvider,
    AppConfigService,
  ],
  imports: [TypeOrmModule.forFeature([Upload])],
  exports: [UploadToAwsProvider],
})
export class UploadsModule {}
