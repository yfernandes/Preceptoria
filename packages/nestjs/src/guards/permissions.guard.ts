import {
  forwardRef,
  Inject,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import type { User } from 'src/user/user.entity';
import { DocumentService } from 'src/documents/document.service';

export interface IsAllowedAccess {
  isUserAllowedToAccess(user: User, resourceId: string): Promise<boolean>;
}

@Injectable()
export class ServiceRegistry {
  constructor(
    @Inject(forwardRef(() => DocumentService))
    public readonly DocumentService: DocumentService,
  ) {}

  getService(serviceType) {
    const serviceMap = {
      [DocumentService.name]: this.DocumentService,
    };
    return serviceMap[serviceType.name] || null;
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private serviceRegistry: ServiceRegistry, // Injected registry
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceServiceType = this.reflector.get<any>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!resourceServiceType) return true; // No specific resource check required

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    if (!user || !resourceId) return false;

    // Retrieve service dynamically
    const resourceService: IsAllowedAccess =
      this.serviceRegistry.getService(resourceServiceType);

    if (!resourceService || !('isUserAllowedToAccess' in resourceService)) {
      throw new Error(
        `Service for ${resourceServiceType} not found or does not implement IsAllowedAccess`,
      );
    }

    return resourceService.isUserAllowedToAccess(user, resourceId);
  }
}
