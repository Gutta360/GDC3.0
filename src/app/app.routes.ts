import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { SetupComponent } from './features/auth/setup.component';
import { HomeComponent } from './features/home/home.component';
import { InProgressComponent } from './features/placeholders/in-progress.component';
import { PatientEditComponent } from './features/patients/pages/patient-edit.component';
import { PatientListComponent } from './features/patients/pages/patient-list.component';
import { PatientRegistrationComponent } from './features/patients/pages/patient-registration.component';
import { AppShellComponent } from './layout/app-shell/app-shell.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'setup', component: SetupComponent },
  {
    path: '', component: AppShellComponent, canActivate: [authGuard], children: [
      { path: 'home', component: HomeComponent },
      { path: 'patients', pathMatch: 'full', redirectTo: 'patients/list' },
      { path: 'patients/list', component: PatientListComponent },
      { path: 'patients/register', component: PatientRegistrationComponent },
      { path: 'patients/:patientNumber/edit', component: PatientEditComponent },
      { path: 'appointments', component: InProgressComponent, data: { title: 'Appointments' } },
      { path: 'treatments', component: InProgressComponent, data: { title: 'Treatments' } },
      { path: 'payments', component: InProgressComponent, data: { title: 'Payments' } },
      { path: 'pharmacy', component: InProgressComponent, data: { title: 'Pharmacy' } }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
