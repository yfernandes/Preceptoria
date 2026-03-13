import { EntityRepository } from "@mikro-orm/postgresql"
import type { Document } from "./document.entity"

export class DocumentRepository extends EntityRepository<Document> {}
