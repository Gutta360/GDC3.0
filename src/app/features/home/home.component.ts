import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OutboxService } from '../../core/sync/outbox.service';
import { PatientService } from '../patients/services/patient.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section class="dashboard-page">
      <div class="dashboard-hero"><div><span class="eyebrow">Offline workspace</span><h1>Good day, {{ greeting }}.</h1><p>Everything you save here is stored on this tablet and remains available without internet.</p></div><div class="offline-badge"><span class="status-dot"></span>Local SQLite ready</div></div>
      <div class="stat-grid"><article class="stat-card"><span>Active patients</span><strong>{{ activePatients }}</strong><a routerLink="/patients/list">View patient register →</a></article><article class="stat-card"><span>Queued local changes</span><strong>{{ outbox.pendingCount() }}</strong><small>Future GDB sync foundation</small></article><article class="stat-card"><span>Next phase</span><strong class="stat-text">Appointments</strong><small>Reserved module</small></article></div>
      <div class="quick-actions"><div><span class="eyebrow">Reception shortcuts</span><h2>Keep the front desk moving</h2></div><a class="primary-button" routerLink="/patients/register">+ Register patient</a></div>
    </section>`
})
export class HomeComponent implements OnInit {
  activePatients = 0;
  constructor(readonly outbox: OutboxService, private readonly patients: PatientService, private readonly changeDetector: ChangeDetectorRef) {}
  get greeting(): string { const hour = new Date().getHours(); return hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'; }
  async ngOnInit(): Promise<void> { this.activePatients = await this.patients.countActive(); await this.outbox.refresh(); this.changeDetector.markForCheck(); }
}
