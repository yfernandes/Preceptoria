import { EntityRepository } from '@mikro-orm/postgresql';
import { Document } from './document.entity';

export class DocumentRepository extends EntityRepository<Document> {}
