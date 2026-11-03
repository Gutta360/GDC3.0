import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OutboxService } from '../../../core/sync/outbox.service';
import type { PatientRequest } from '../models/patient.model';
import { PatientFormComponent } from '../components/patient-form.component';
import { PatientService } from '../services/patient.service';

@Component({
  selector: 'app-patient-registration',
  imports: [PatientFormComponent, RouterLink],
  template: `<section class="content-card"><header class="page-header page-header-row"><div><span class="eyebrow">Patient registration</span><h1>Register a patient</h1><p>Create a patient record directly in the tablet’s encrypted SQLite store.</p></div><a class="secondary-button" routerLink="/patients/list">View patient register</a></header><app-patient-form [loading]="loading" (formSubmit)="create($event)" /></section>@if (message) { <div class="toast" [class.error]="error" role="alert">{{ message }}</div> }`
})
export class PatientRegistrationComponent {
  loading = false; message = ''; error = false;
  constructor(private readonly patients: PatientService, private readonly outbox: OutboxService, private readonly changeDetector: ChangeDetectorRef) {}
  async create(request: PatientRequest): Promise<void> {
    this.loading = true; this.message = '';
    try { const patient = await this.patients.create(request); await this.outbox.refresh(); this.error = false; this.message = `${patient.patientNumber} registered successfully.`; }
    catch (error) { this.error = true; this.message = error instanceof Error ? error.message : 'Could not register patient.'; }
    finally { this.loading = false; this.changeDetector.markForCheck(); }
  }
}
