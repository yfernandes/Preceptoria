import { UserRoles } from "../entities/role.abstract";
export enum Resource {
	Hospital = "Hospital",
	Student = "Student",
	School = "School",
	Course = "Course",
	Classes = "Classes",
	Document = "Document",
	Shift = "Shift",
}
export enum Actions {
	Create = "Create",
	Read = "Read",
	Update = "Update",
	Delete = "Delete",
}

export enum Modifiers {
	Own = "Own",
	Managed = "Managed",
	Students = "Students", // Permission to do something on behalf of the Student
}

type Perm = (`${Resource}:${Actions}_${Modifiers}` | "*:*:*")[];
export const rolesPermissions: Record<keyof typeof UserRoles, Perm> = {
	SysAdmin: ["*:*:*"],
	OrgAdmin: [
		"Hospital:Read_Managed",
		"Hospital:Update_Managed",
		"School:Read_Managed",
		"School:Update_Managed",
		"Course:Create_Managed",
		"Course:Read_Managed",
		"Course:Update_Managed",
		"Course:Delete_Managed",
		"Classes:Create_Managed",
		"Classes:Read_Managed",
		"Classes:Update_Managed",
		"Classes:Delete_Managed",
	],
	Supervisor: [
		"Classes:Create_Own",
		"Classes:Read_Own",
		"Classes:Update_Own",
		"Classes:Delete_Own",
		"Student:Create_Own",
		"Student:Read_Own",
		"Student:Update_Own",
		"Student:Delete_Own",
		"Document:Create_Students",
		"Document:Read_Students",
		"Document:Update_Students",
		"Document:Delete_Students",
	],
	HospitalManager: [
		"Shift:Read_Own",
		"Student:Read_Own",
		"Document:Read_Managed",
		"Classes:Read_Managed",
	],
	Preceptor: ["Shift:Read_Own", "Hospital:Read_Own", "Student:Read_Own"],
	Student: [
		"Document:Create_Own",
		"Document:Read_Own",
		"Document:Update_Own",
		"Document:Delete_Own",
		"Classes:Read_Own",
		"Shift:Read_Own",
	],
} as const;
