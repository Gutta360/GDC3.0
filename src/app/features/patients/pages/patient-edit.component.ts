import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OutboxService } from '../../../core/sync/outbox.service';
import type { PatientRecord, PatientRequest } from '../models/patient.model';
import { PatientFormComponent } from '../components/patient-form.component';
import { PatientService } from '../services/patient.service';

@Component({
  selector: 'app-patient-edit',
  imports: [PatientFormComponent, RouterLink],
  template: `<section class="content-card"><header class="page-header"><span class="eyebrow">{{ patientNumber }} · Patient registration</span><h1>Edit patient details</h1><p>Changes are versioned locally and recorded in the outbox in the same transaction.</p></header>@if (patient) { <app-patient-form mode="edit" [initialData]="patient" [loading]="loading" (formSubmit)="update($event)" /><footer class="form-footer"><a class="secondary-button" routerLink="/patients/list">Close</a></footer> } @else { <div class="empty-state">{{ message || 'Loading patient…' }}</div> }</section>@if (message && patient) { <div class="toast" [class.error]="error" role="alert">{{ message }}</div> }`
})
export class PatientEditComponent implements OnInit {
  readonly patientNumber: string; patient: PatientRecord | null = null; loading = false; message = ''; error = false;
  constructor(private readonly route: ActivatedRoute, private readonly router: Router, private readonly patients: PatientService, private readonly outbox: OutboxService, private readonly changeDetector: ChangeDetectorRef) { this.patientNumber = this.route.snapshot.paramMap.get('patientNumber') ?? ''; }
  async ngOnInit(): Promise<void> { this.patient = await this.patients.get(this.patientNumber); if (!this.patient) this.message = 'Patient was not found.'; this.changeDetector.markForCheck(); }
  async update(request: PatientRequest): Promise<void> {
    this.loading = true; this.message = '';
    try { this.patient = await this.patients.update(this.patientNumber, request); await this.outbox.refresh(); this.error = false; this.message = 'Patient updated successfully.'; }
    catch (error) { this.error = true; this.message = error instanceof Error ? error.message : 'Update failed.'; }
    finally { this.loading = false; this.changeDetector.markForCheck(); }
  }
  close(): void { void this.router.navigate(['/patients/list']); }
}
