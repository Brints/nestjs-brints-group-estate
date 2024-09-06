import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './providers/uploads.service';
import { UploadToAwsProvider } from './providers/upload-to-aws.provider';
import { UploadToCloudinaryProvider } from './providers/upload-to-cloudinary.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Upload } from './upload.entity';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, UploadToAwsProvider, UploadToCloudinaryProvider],
  imports: [TypeOrmModule.forFeature([Upload])],
})
export class UploadsModule {}
