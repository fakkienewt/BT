import { Routes } from '@angular/router';
import { Main } from './basic/main/main';
import { Catalog } from './basic/catalog/catalog';

export const routes: Routes = [
    { path: '', component: Main },
    { path: 'catalog', component: Catalog },
];
