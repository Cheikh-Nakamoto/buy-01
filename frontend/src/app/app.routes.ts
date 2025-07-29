import { Routes } from '@angular/router';
import { SignIn } from './auth/sign-in/sign-in';
import { Dashboard } from './seller/dashboard/dashboard';
import { ProductList } from './products/product-list/product-list';
import { GuardService } from './services/guard-service';
import { Profile } from './profile/profile';
import { FormProduct } from './seller/form-product/form-product';

export const routes: Routes = [
    { path: '', component: ProductList },
    { path: 'auth', component: SignIn},
    { path: 'dashboard', component: Dashboard, canActivate: [GuardService] },
    { path: 'profil', component: Profile, canActivate: [GuardService] },
    { path: 'products/new', component: FormProduct, canActivate: [GuardService] },
];