import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification
		}
	}),
	emailAndPassword: { enabled: true },
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID || '',
			clientSecret: env.GITHUB_CLIENT_SECRET || ''
		},
		google: {
			clientId: env.GOOGLE_CLIENT_ID || '',
			clientSecret: env.GOOGLE_CLIENT_SECRET || ''
		}
	},
	credentials: {
		mock: {
			name: 'Mock Auth',
			enabled: import.meta.env.DEV,
			fields: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' }
			},
			async authorize(credentials: Record<string, unknown>) {
				const schema_auth = z.object({
					email: z.string().email(),
					password: z.string()
				});
				const parsed = schema_auth.safeParse(credentials);
				if (!parsed.success) return null;

				const { email, password } = parsed.data;
				if (password !== '123456') return null;

				const roleMap: Record<string, typeof schema.user.$inferSelect.role> = {
					estudante: 'Student',
					preceptor: 'Preceptor',
					supervisor: 'Supervisor',
					instituicao: 'OrgAdmin',
					sysadmin: 'SysAdmin'
				};

				const prefix = email.split('@')[0].toLowerCase();
				const role = roleMap[prefix];

				if (role && email.endsWith('@preceptoria.com')) {
					// Check if user exists, otherwise create a mock one
					let existingUser = await db.query.user.findFirst({
						where: (u, { eq }) => eq(u.email, email)
					});

					if (!existingUser) {
						const id = crypto.randomUUID();
						const [newUser] = await db
							.insert(schema.user)
							.values({
								id,
								name: prefix.charAt(0).toUpperCase() + prefix.slice(1),
								email,
								emailVerified: true,
								role,
								createdAt: new Date(),
								updatedAt: new Date()
							})
							.returning();
						existingUser = newUser;
					}

					return {
						id: existingUser.id,
						email: existingUser.email,
						name: existingUser.name,
						role: existingUser.role
					};
				}
				return null;
			}
		}
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				defaultValue: 'Supervisor',
				input: true
			}
		}
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					// Check if there's a pending invitation for this email
					const invitation = await db.query.invitations.findFirst({
						where: (i, { eq, and, gt }) =>
							and(
								eq(i.email, user.email),
								eq(i.status, 'PENDING'),
								gt(i.expiresAt, new Date())
							)
					});

					if (invitation) {
						return {
							data: {
								...user,
								role: invitation.role
							}
						};
					}
					return { data: user };
				},
				after: async (user) => {
					// Link to student profile if role is Student
					const invitation = await db.query.invitations.findFirst({
						where: (i, { eq, and }) => and(eq(i.email, user.email), eq(i.status, 'PENDING'))
					});

					if (invitation) {
						if (invitation.role === 'Student' && invitation.classId) {
							await db.insert(schema.students).values({
								userId: user.id,
								classId: invitation.classId
							});
						} else if (invitation.role === 'Preceptor' && invitation.hospitalId) {
							await db.insert(schema.preceptors).values({
								userId: user.id,
								hospitalId: invitation.hospitalId
							});
						} else if (invitation.role === 'HospitalManager' && invitation.hospitalId) {
							await db.insert(schema.hospitalManagers).values({
								userId: user.id,
								hospitalId: invitation.hospitalId
							});
						}

						// Mark invitation as accepted
						await db
							.update(schema.invitations)
							.set({ status: 'ACCEPTED' })
							.where(eq(schema.invitations.id, invitation.id));
					}
				}
			}
		}
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});
