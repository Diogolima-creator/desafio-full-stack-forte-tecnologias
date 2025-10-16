import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'companies',
    pathMatch: 'full'
  },
  {
    path: 'companies',
    loadComponent: () => import('./pages/companies/companies.component').then(m => m.CompaniesComponent)
  },
  {
    path: 'employees',
    loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent)
  },
  {
    path: 'assets',
    loadComponent: () => import('./pages/assets/assets.component').then(m => m.AssetsComponent)
  }
];
