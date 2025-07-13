import { Entity } from "@mikro-orm/postgresql";
import { Role } from "../common/role.abstract";

@Entity()
export class SysAdmin extends Role {} // Bestowed at birth with the powers of a GOD MUAHAUHAUHAUAHA
