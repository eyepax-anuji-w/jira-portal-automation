export type Role = 'user' | 'supervisor' | 'admin';

export const Users = {
  user: {
    id: process.env.E2E_USER_ID ?? '',
    password: process.env.E2E_PASSWORD ?? '',
  },
  supervisor: {
    id: process.env.E2E_SUPERVISOR_ID ?? '',
    password: process.env.E2E_SUPERVISOR_PASSWORD ?? '',
  },
  admin: {
    id: process.env.E2E_ADMIN_ID ?? '',
    password: process.env.E2E_ADMIN_PASSWORD ?? '',
  },
} as const;

export function hasUserCredentials(): boolean {
  return Boolean(Users.user.id && Users.user.password);
}

export function storageStatePath(role: Role): string {
  const map: Record<Role, string> = {
    user: 'auth/user.json',
    supervisor: 'auth/supervisor.json',
    admin: 'auth/admin.json',
  };
  return map[role];
}
