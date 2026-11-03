import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { PatientRecord, PatientSummary } from '../models/patient.model';
import { PatientService } from '../services/patient.service';

@Component({
  selector: 'app-patient-list',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="content-card">
      <header class="page-header page-header-row"><div><span class="eyebrow">Patient registration</span><h1>Patient register</h1><p>Search, review, edit, or deactivate active patient records stored locally.</p></div><a class="primary-button" routerLink="/patients/register">+ Register patient</a></header>
      <div class="search-panel"><label for="patient-search">Search patients</label><input id="patient-search" [(ngModel)]="query" (ngModelChange)="search()" placeholder="Patient ID, name, or mobile number" /></div>
      <div class="details-layout">
        <div class="patient-list" aria-label="Patient search results">
          @for (item of results; track item.id) { <button type="button" [class.selected]="item.patientNumber === selected?.patientNumber" (click)="select(item)"><strong>{{ item.patientNumber }}</strong><span>{{ item.firstName }} {{ item.lastName }}</span><small>{{ item.mobile }}</small></button> }
          @empty { <div class="empty-state">{{ query.length === 1 ? 'Type at least two characters to search.' : 'No active patients found.' }}</div> }
        </div>
        <div class="patient-detail">
          @if (selected) {
            <div class="detail-heading"><div><span class="eyebrow">{{ selected.patientNumber }} · Version {{ selected.recordVersion }}</span><h2>{{ selected.firstName }} {{ selected.lastName }}</h2></div><button type="button" class="secondary-button" (click)="edit()">Edit</button></div>
            <dl><div><dt>Gender</dt><dd>{{ label(selected.gender) }}</dd></div><div><dt>Age</dt><dd>{{ selected.age }}</dd></div><div><dt>Mobile</dt><dd>{{ selected.mobile }}</dd></div><div><dt>Registration</dt><dd>{{ formatDate(selected.registrationDate) }}</dd></div><div class="wide"><dt>Address</dt><dd>{{ selected.address }}</dd></div><div><dt>Referred by</dt><dd>{{ label(selected.referredBy) }} @if (selected.doctorName) { · {{ selected.doctorName }} }</dd></div><div><dt>Consultation fee</dt><dd>{{ selected.consultationFee === 0 ? 'Free' : '₹' + selected.consultationFee.toFixed(2) }}</dd></div><div><dt>Last updated</dt><dd>{{ formatDate(selected.updatedAt) }}</dd></div></dl>
            <div class="detail-actions"><button type="button" class="danger-button" (click)="deactivate()">Deactivate patient</button><small>Deactivation keeps a local tombstone for future synchronization.</small></div>
          } @else { <div class="empty-state detail-empty"><h2>Select a patient</h2><p>Choose a record to view its details.</p></div> }
        </div>
      </div>
    </section>
    @if (message) { <div class="toast" [class.error]="error" role="alert">{{ message }}</div> }`
})
export class PatientListComponent implements OnInit {
  query = ''; results: PatientSummary[] = []; selected: PatientRecord | null = null; message = ''; error = false; private searchGeneration = 0;
  constructor(private readonly patients: PatientService, private readonly router: Router, private readonly changeDetector: ChangeDetectorRef) {}
  ngOnInit(): void { void this.search(); }
  async search(): Promise<void> { const generation = ++this.searchGeneration; const results = await this.patients.search(this.query); if (generation === this.searchGeneration) { this.results = results; this.changeDetector.markForCheck(); } }
  async select(item: PatientSummary): Promise<void> { this.selected = await this.patients.get(item.patientNumber); this.changeDetector.markForCheck(); }
  edit(): void { if (this.selected) void this.router.navigate(['/patients', this.selected.patientNumber, 'edit']); }
  async deactivate(): Promise<void> {
    if (!this.selected || !confirm(`Deactivate ${this.selected.patientNumber}?`)) return;
    try { await this.patients.deactivate(this.selected.patientNumber); this.message = 'Patient deactivated and queued as a tombstone.'; this.error = false; this.selected = null; await this.search(); }
    catch (error) { this.message = error instanceof Error ? error.message : 'Could not deactivate patient.'; this.error = true; }
    this.changeDetector.markForCheck();
  }
  label(value: string): string { return value.charAt(0) + value.slice(1).toLowerCase(); }
  formatDate(value: string): string { return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
}
