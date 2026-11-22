
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';

export const adminAuthGuard: CanActivateFn = async () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);

  try {
    const isAdmin = await auth.hasAdminAccess();

    if (isAdmin) {
      return true;
    }
  } catch (error) {
    console.error('Erreur de vérification administrateur :', error);
  }

  return router.createUrlTree(['/admin/connexion']);
};
