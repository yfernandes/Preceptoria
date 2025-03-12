import { Migration } from '@mikro-orm/migrations';

export class Migration20250220182231 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "hospital" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "address" varchar(255) not null, "email" varchar(255) not null, "phone" varchar(255) not null, constraint "hospital_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "school" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "address" varchar(255) not null, "email" varchar(255) not null, "phone" varchar(255) not null, constraint "school_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "user" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "email" varchar(255) not null, "phone_number" varchar(255) not null, "password_hash" varchar(255) not null, constraint "user_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "sys_admin" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" uuid not null, constraint "sys_admin_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "sys_admin" add constraint "sys_admin_user_id_unique" unique ("user_id");`,
    );

    this.addSql(
      `create table "supervisor" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" uuid not null, constraint "supervisor_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "supervisor" add constraint "supervisor_user_id_unique" unique ("user_id");`,
    );

    this.addSql(
      `create table "course" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "school_id" uuid not null, "supervisor_id" uuid not null, constraint "course_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "classes" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "course_id" uuid not null, constraint "classes_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "student" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" uuid not null, "class_id" uuid not null, constraint "student_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "student" add constraint "student_user_id_unique" unique ("user_id");`,
    );

    this.addSql(
      `create table "document" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" uuid not null, "name" varchar(255) not null, "type" text check ("type" in ('')) not null, "url" varchar(255) not null, "uploaded_at" timestamptz not null, "verified" boolean not null default false, constraint "document_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "preceptor" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" uuid not null, "hospital_id" uuid not null, constraint "preceptor_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "preceptor" add constraint "preceptor_user_id_unique" unique ("user_id");`,
    );

    this.addSql(
      `create table "shift" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "date" timestamptz not null, "start_time" timestamptz not null, "end_time" timestamptz not null, "location" varchar(255) not null, "hospital_id" uuid not null, "preceptor_id" uuid not null, constraint "shift_pkey" primary key ("id"));`,
    );

    this.addSql(
      `create table "shift_students" ("shift_id" uuid not null, "student_id" uuid not null, constraint "shift_students_pkey" primary key ("shift_id", "student_id"));`,
    );

    this.addSql(
      `create table "org_admin" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" uuid not null, "hospital_id" uuid null, "school_id" uuid null, constraint "org_admin_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "org_admin" add constraint "org_admin_user_id_unique" unique ("user_id");`,
    );

    this.addSql(
      `create table "hospital_manager" ("id" uuid not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" uuid not null, "hospital_id" uuid not null, constraint "hospital_manager_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "hospital_manager" add constraint "hospital_manager_user_id_unique" unique ("user_id");`,
    );

    this.addSql(
      `alter table "sys_admin" add constraint "sys_admin_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "supervisor" add constraint "supervisor_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "course" add constraint "course_school_id_foreign" foreign key ("school_id") references "school" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "course" add constraint "course_supervisor_id_foreign" foreign key ("supervisor_id") references "supervisor" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "classes" add constraint "classes_course_id_foreign" foreign key ("course_id") references "course" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "student" add constraint "student_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "student" add constraint "student_class_id_foreign" foreign key ("class_id") references "classes" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "document" add constraint "document_user_id_foreign" foreign key ("user_id") references "student" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "preceptor" add constraint "preceptor_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "preceptor" add constraint "preceptor_hospital_id_foreign" foreign key ("hospital_id") references "hospital" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "shift" add constraint "shift_hospital_id_foreign" foreign key ("hospital_id") references "hospital" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "shift" add constraint "shift_preceptor_id_foreign" foreign key ("preceptor_id") references "preceptor" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "shift_students" add constraint "shift_students_shift_id_foreign" foreign key ("shift_id") references "shift" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "shift_students" add constraint "shift_students_student_id_foreign" foreign key ("student_id") references "student" ("id") on update cascade on delete cascade;`,
    );

    this.addSql(
      `alter table "org_admin" add constraint "org_admin_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "org_admin" add constraint "org_admin_hospital_id_foreign" foreign key ("hospital_id") references "hospital" ("id") on update cascade on delete set null;`,
    );
    this.addSql(
      `alter table "org_admin" add constraint "org_admin_school_id_foreign" foreign key ("school_id") references "school" ("id") on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table "hospital_manager" add constraint "hospital_manager_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "hospital_manager" add constraint "hospital_manager_hospital_id_foreign" foreign key ("hospital_id") references "hospital" ("id") on update cascade;`,
    );
  }
}
