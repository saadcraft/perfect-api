import { SetMetadata } from '@nestjs/common';
import { Role } from '../../schemas/user.schema';

export const Roles = (...roles: [Role, ...Role[]]) => SetMetadata('roles', roles);