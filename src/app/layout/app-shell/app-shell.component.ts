import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { APP_BRAND, type ModuleKey } from '../../core/configuration/app-brand';
import { OutboxService } from '../../core/sync/outbox.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <header class="main-header">
        <a class="brand" routerLink="/home"><span class="brand-mark small">G</span><span>{{ brand.name }}</span></a>
        <nav class="main-navigation" aria-label="Main navigation">
          <a class="nav-item home-link" routerLink="/home" routerLinkActive="active">Home</a>
          <a class="nav-item" routerLink="/patients/list" routerLinkActive="active">Patients</a>
          <a class="nav-item" routerLink="/appointments" routerLinkActive="active">Appointments</a>
          <a class="nav-item" routerLink="/treatments" routerLinkActive="active">Treatments</a>
          <a class="nav-item" routerLink="/payments" routerLinkActive="active">Payments</a>
          <a class="nav-item" routerLink="/pharmacy" routerLinkActive="active">Pharmacy</a>
        </nav>
        <div class="header-actions">
          <button class="sync-status" type="button" disabled title="GDB synchronization is planned for a future phase"><span class="status-dot"></span>{{ outbox.pendingCount() }} queued</button>
          <button class="icon-button power" type="button" aria-label="Logout" title="Logout" (click)="logout()">↪</button>
        </div>
      </header>
      <main class="application-content"><router-outlet /></main>
      @if (toast()) { <div class="toast" role="status">{{ toast() }}</div> }
    </div>`
})
export class AppShellComponent {
  readonly brand = APP_BRAND; readonly toast = signal('');
  constructor(readonly outbox: OutboxService, private readonly auth: AuthService, private readonly router: Router) { void this.outbox.refresh(); }
  isEnabled(module: ModuleKey): boolean { return APP_BRAND.enabledModules.includes(module); }
  async logout(): Promise<void> { this.auth.logout(); await this.router.navigate(['/login']); }
}
