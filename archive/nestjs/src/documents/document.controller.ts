import { Controller, Get } from "@nestjs/common"
import { Permissions } from "src/guards/permissions.decorator"
import type { User } from "src/user/user.entity"
import { DocumentService } from "./document.service"

@Controller()
export class DocumentsController {
	constructor(private readonly documentService: DocumentService) {}

	@Get()
	@Permissions(DocumentService)
	async findAll(user: User) {
		return this.documentService.findAll(user)
	}
}
