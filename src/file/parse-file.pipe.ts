import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class ParseFile implements PipeTransform {
  transform(
    file: Express.Multer.File,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _metadata: ArgumentMetadata,
  ): Express.Multer.File {
    if (file === undefined || file === null) {
      throw new BadRequestException('Validate file');
    }
    return file;
  }
}
