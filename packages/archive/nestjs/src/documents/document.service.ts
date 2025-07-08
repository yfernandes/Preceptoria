import { Injectable } from '@nestjs/common';
import { DocumentRepository } from './document.repository';
import type { User } from 'src/user/user.entity';
import { UserRoles } from 'src/role.abstract';
import type { IsAllowedAccess } from 'src/guards/permissions.guard';

@Injectable()
export class DocumentService implements IsAllowedAccess {
  constructor(private readonly documentRepo: DocumentRepository) {}

  async findAll(user: User) {
    const whereCondition: any = {};

    if (user.roles.includes(UserRoles.SysAdmin)) {
      // SysAdmins can access everything, so no filter needed
    } else if (user.roles.includes(UserRoles.OrgAdmin)) {
      // OrgAdmins can only access documents within their organization

      if (user.orgAdmin?.hospital) {
        whereCondition.schoolId = user.orgAdmin?.school?.id;
      }
    } else if (user.roles.includes(UserRoles.Supervisor)) {
      // Supervisors can only access documents of their own students
      whereCondition.student = { supervisorId: user.id };
    } else if (user.roles.includes(UserRoles.Student)) {
      // Students can only access their own documents
      whereCondition.student = { userId: user.id };
    } else {
      throw new Error('Unauthorized role');
    }
    return await this.documentRepo.findAll({
      where: { student: { user: { id: user.id } } },
    });
  }

  async isUserAllowedToAccess(
    user: User,
    documentId: string,
  ): Promise<boolean> {
    const document = await this.documentRepo.findOne(documentId, {
      populate: ['student', 'student.class.course.supervisor'],
    });

    if (!document) return false;

    // Students can only see their own documents
    if (user.roles.includes(UserRoles.Student)) {
      return document.student.id === user.id;
    }

    // Supervisors can only see their own students' documents
    if (user.roles.includes(UserRoles.Supervisor)) {
      return document.student.class.course.supervisor.id === user.id;
    }

    return false;
  }
}
