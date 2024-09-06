import { FileTypes } from '../enums/file-types.enum';

export interface UploadFile {
  file_name: string;
  file_path: string;
  file_type: FileTypes;
  file_mime: string;
  file_size: number;
}
