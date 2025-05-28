import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';
export const Public = (isPublic: boolean = true) => SetMetadata(IS_PUBLIC, isPublic);
