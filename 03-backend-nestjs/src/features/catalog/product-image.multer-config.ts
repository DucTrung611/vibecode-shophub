import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

export const PRODUCT_IMAGES_DIR = join(process.cwd(), 'uploads', 'products');
export const PRODUCT_IMAGES_URL_PREFIX = '/uploads/products';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const productImageMulterOptions = {
  storage: diskStorage({
    destination: (_req, _file, callback) => {
      if (!existsSync(PRODUCT_IMAGES_DIR)) {
        mkdirSync(PRODUCT_IMAGES_DIR, { recursive: true });
      }
      callback(null, PRODUCT_IMAGES_DIR);
    },
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, accept: boolean) => void,
  ) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(
        new BadRequestException('Only JPEG, PNG, or WEBP images are allowed'),
        false,
      );
      return;
    }
    callback(null, true);
  },
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
};
