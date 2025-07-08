import { Migration } from "@mikro-orm/migrations";

export class Migration20250705002602_AddProfessionalIdentityNumber extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table "user" add column "professional_identity_number" varchar(255) null;`
		);
	}
}
