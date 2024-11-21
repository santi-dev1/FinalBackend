import { SetMetadata } from '@nestjs/common';

// Roles requeridos como metadata
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);