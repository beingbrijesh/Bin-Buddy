import { ROLES } from '../constants/roles';

export const getDashboardRoute = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return '/dashboard/admin';
    case ROLES.WORKER:
      return '/dashboard/worker';
    case ROLES.VOLUNTEER:
      return '/dashboard/volunteer';
    case ROLES.USER:
    default:
      return '/dashboard/user';
  }
};

export const isAuthRoute = (pathname) => {
  return pathname.includes('/dashboard');
}; 