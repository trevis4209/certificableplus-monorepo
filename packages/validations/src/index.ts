/**
 * @certplus/validations - Zod Validation Schemas
 * CertificablePlus Monorepo
 *
 * Shared validation schemas for forms and data
 */

// Auth schemas
export { loginSchema, registerSchema } from './auth';
export type { LoginInput, RegisterInput } from './auth';

// Product schemas
export { productSchema } from './product';
export type { ProductInput } from './product';

// Maintenance schemas
export { maintenanceSchema } from './maintenance';
export type { MaintenanceInput } from './maintenance';
