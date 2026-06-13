import { Routes } from '@angular/router';
import { Main } from './basic/main/main';
import { Catalog } from './basic/catalog/catalog';
import { ProductPage } from './product-page/product-page';
import { Registration } from './registration/registration';
import { Profile } from './profile/profile';
import { Search } from './basic/search/search';

export const routes: Routes = [
    { path: '', component: Main },
    { path: 'catalog', component: Catalog },
    { path: 'product/:id', component: ProductPage },
    { path: 'auth', component: Registration },
    { path: 'profile', component: Profile },
    { path: 'main', component: Main },
    { path: 'search', component: Search }
]
