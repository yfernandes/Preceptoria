import { Controller, Get } from '@nestjs/common';
import { DocumentService } from './document.service';
import type { User } from 'src/user/user.entity';
import { Permissions } from 'src/guards/permissions.decorator';

@Controller()
export class DocumentsController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  @Permissions(DocumentService)
  async findAll(user: User) {
    return this.documentService.findAll(user);
  }
}
