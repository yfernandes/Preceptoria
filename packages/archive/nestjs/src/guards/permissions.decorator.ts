import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';

export const PERMISSIONS_KEY = 'permissions';

export function Permissions(resourceService: any) {
  return applyDecorators(
    SetMetadata(PERMISSIONS_KEY, resourceService),
    UseGuards(PermissionsGuard),
  );
}
