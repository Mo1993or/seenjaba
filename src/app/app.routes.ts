
import { Routes } from '@angular/router';

import { StorefrontComponent } from './pages/storefront.component';
import { AdminComponent } from './pages/admin.component';
import { AdminLoginComponent } from './pages/admin-login.component';
import { ProductDetailComponent } from './pages/product-detail.component';
import { CartComponent } from './pages/cart.component';
import { CheckoutComponent } from './pages/checkout.component';

import { adminAuthGuard } from './services/admin-auth.guard';

export const routes: Routes = [
  { path: '', component: StorefrontComponent },

  { path: 'produit/:slug', component: ProductDetailComponent },

  { path: 'panier', component: CartComponent },

  { path: 'commande', component: CheckoutComponent },

  {
    path: 'admin/connexion',
    component: AdminLoginComponent
  },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminAuthGuard]
  },

  { path: '**', redirectTo: '' }
];
