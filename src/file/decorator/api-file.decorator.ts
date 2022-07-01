import {
  applyDecorators,
  UseInterceptors,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
// import { diskStorage } from 'multer';
// import { extname } from 'path';

// Validate file global
export function ApiFile(
  _fieldName = 'file',
  _required = false,
  localOptions?: MulterOptions,
) {
  return applyDecorators(
    UseInterceptors(FileInterceptor(_fieldName, localOptions)),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: _required ? [_fieldName] : [],
        properties: {
          [_fieldName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
}

// Validate file with size file type and location save image
export function ApiImageFile(fileName = 'image', required = false) {
  return ApiFile(fileName, required, {
    limits: {
      fileSize: 1048576,
    },
    fileFilter: fileMimetypeFilter('image'),
    // storage: diskStorage({
    //   destination: './public/images',
    //   filename: genFileName(),
    // }),
  });
}

// Filter file type
function fileMimetypeFilter(...mimetypes: string[]) {
  return (
    req,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (mimetypes.some((m) => file.mimetype.includes(m))) {
      callback(null, true);
    } else {
      callback(
        new UnsupportedMediaTypeException(
          `File type is not matching: ${mimetypes.join(', ')}`,
        ),
        false,
      );
    }
  };
}

// // Rename file
// function genFileName() {
//   return (
//     req,
//     file: Express.Multer.File,
//     callback: (error: Error | null, fileName: string) => void,
//   ) => {
//     // Generating a 32 random chars long string
//     const randomName = Array(32)
//       .fill(null)
//       .map(() => Math.round(Math.random() * 16).toString(16))
//       .join('');
//     callback(null, `${randomName}${extname(file.originalname)}`);
//   };
// }
