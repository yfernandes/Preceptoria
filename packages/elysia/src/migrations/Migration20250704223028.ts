import { Migration } from '@mikro-orm/migrations';

export class Migration20250704223028 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "document" drop constraint if exists "document_type_check";`);

    this.addSql(`alter table "supervisor" add column "school_id" uuid not null;`);
    this.addSql(`alter table "supervisor" add constraint "supervisor_school_id_foreign" foreign key ("school_id") references "school" ("id") on update cascade;`);

    this.addSql(`alter table "preceptor" add column "specialty" varchar(255) not null, add column "license_number" varchar(255) not null;`);

    this.addSql(`alter table "document" add column "description" varchar(255) null, add column "thumbnail_url" varchar(255) null, add column "expires_at" timestamptz null, add column "status" text check ("status" in ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')) not null default 'PENDING', add column "rejection_reason" varchar(255) null, add column "verified_by_id" uuid null, add column "verified_at" timestamptz null, add column "file_size" int null, add column "mime_type" varchar(255) null, add column "is_public" boolean not null default false, add column "validation_checks" jsonb null, add column "validation_notes" varchar(255) null, add column "original_file_name" varchar(255) null, add column "google_drive_id" varchar(255) null;`);
    this.addSql(`alter table "document" add constraint "document_verified_by_id_foreign" foreign key ("verified_by_id") references "user" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "document" add constraint "document_type_check" check("type" in ('PROFESSIONAL_ID', 'VACCINATION_CARD', 'COMMITMENT_CONTRACT', 'ADMISSION_FORM', 'BADGE_PICTURE', 'INSURANCE_DOCUMENTATION', 'OTHER'));`);
    this.addSql(`alter table "document" rename column "verified" to "is_required";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "supervisor" drop constraint "supervisor_school_id_foreign";`);

    this.addSql(`alter table "document" drop constraint if exists "document_type_check";`);

    this.addSql(`alter table "document" drop constraint "document_verified_by_id_foreign";`);

    this.addSql(`alter table "document" add constraint "document_type_check" check("type" in (''));`);
    this.addSql(`alter table "document" rename column "is_required" to "verified";`);
  }

}
