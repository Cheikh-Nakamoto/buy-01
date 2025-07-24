import { Routes } from '@angular/router';
import { SignIn } from './auth/sign-in/sign-in';
import { MediaManagement } from './media/media-management/media-management';
import { Dashboard } from './seller/dashboard/dashboard';
import { ProductList } from './products/product-list/product-list';
import { GuardService } from './services/guard-service';
import { Profile } from './profile/profile';

export const routes: Routes = [
    { path: '', component: ProductList },
    { path: 'auth', component: SignIn},
    { path: 'media', component: MediaManagement, canActivate: [GuardService] },
    { path: 'dashboard', component: Dashboard, canActivate: [GuardService] },
    { path: 'profil', component: Profile, canActivate: [GuardService] },
];