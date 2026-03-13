import { EntityRepository } from "@mikro-orm/postgresql"
import type { Preceptor } from "./preceptor.entity"

export class PreceptorRepository extends EntityRepository<Preceptor> {}
