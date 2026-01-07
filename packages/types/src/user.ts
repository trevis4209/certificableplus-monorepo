/**
 * User Types - CertificablePlus Monorepo
 * Shared between Web and Mobile apps
 */

export type UserRole = 'company' | 'employee' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}
