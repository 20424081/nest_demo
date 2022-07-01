import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { extname } from 'path';

@Injectable()
export class FileService {
  private S3: AWS.S3;
  private bucket: string;
  constructor(protected readonly configService: ConfigService) {
    this.S3 = new AWS.S3({
      credentials: {
        accessKeyId: configService.get('aws.access_key_id'),
        secretAccessKey: configService.get('aws.secret_access_key'),
      },
    });
    this.bucket = configService.get('aws.public_bucket_name');
  }

  async uploadPublicFile(file: Express.Multer.File) {
    const fileName = this.genFileName(file);
    const params = {
      Bucket: this.bucket,
      Key: String(fileName),
      Body: file.buffer,
    };
    return await this.S3.upload(params).promise();
  }

  // Rename file
  genFileName(file: Express.Multer.File): string {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    return `${randomName}-${Date.now()}${extname(file.originalname)}`;
  }
}
