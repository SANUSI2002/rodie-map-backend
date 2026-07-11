import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Marks a route as requiring "edit" permission (anyone except VIEWER).
export const EDITOR_KEY = 'requiresEditor';
export const RequireEditor = () => SetMetadata(EDITOR_KEY, true);

// Marks a route as public (no JWT required) even though it sits behind the global guard.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
