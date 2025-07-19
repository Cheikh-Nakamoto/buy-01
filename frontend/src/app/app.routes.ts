import { Routes } from '@angular/router';
import { SignIn } from './auth/sign-in/sign-in';
import { MediaManagement } from './media/media-management/media-management';
import { Dashboard } from './seller/dashboard/dashboard';
import { ProductList } from './products/product-list/product-list';

export const routes: Routes = [
    { path: '', component: ProductList },
    { path: 'auth', component: SignIn },
    { path: 'media', component: MediaManagement },
    { path: 'dashboard', component: Dashboard },
];