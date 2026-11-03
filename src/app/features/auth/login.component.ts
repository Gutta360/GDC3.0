import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { APP_BRAND } from '../../core/configuration/app-brand';
import { DatabaseService } from '../../core/database/database.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <main class="auth-page">
      <section class="auth-card">
        <header class="auth-header"><div class="brand-mark">G</div><div><h1>{{ brand.name }}</h1><p>{{ brand.businessName }} · Offline-first clinic tablet</p></div></header>
        <form (ngSubmit)="login()">
          <div class="auth-body"><h2>Welcome back</h2><p class="muted">Sign in to work with local clinic records.</p>
            @if (database.state() !== 'ready') { <div class="alert" role="alert">{{ database.errorMessage() || 'Opening encrypted SQLite…' }}</div> }
            <label>Username<input name="username" [(ngModel)]="username" autocomplete="username" required /></label>
            <label>Password<input name="password" type="password" [(ngModel)]="password" autocomplete="current-password" required /></label>
            @if (message) { <div class="alert" role="alert">{{ message }}</div> }
          </div>
          <footer class="auth-footer"><button class="primary-button" type="submit" [disabled]="busy || database.state() !== 'ready'">{{ busy ? 'Signing in…' : 'Open clinic workspace' }}</button></footer>
        </form>
      </section>
    </main>`
})
export class LoginComponent implements OnInit {
  readonly brand = APP_BRAND;
  username = ''; password = ''; message = ''; busy = false;
  constructor(readonly database: DatabaseService, private readonly auth: AuthService, private readonly router: Router, private readonly changeDetector: ChangeDetectorRef) {}
  async ngOnInit(): Promise<void> {
    if (this.database.state() === 'ready' && !(await this.auth.hasEnrolledUser())) await this.router.navigate(['/setup']);
    this.changeDetector.markForCheck();
  }
  async login(): Promise<void> {
    if (!this.username.trim() || !this.password) { this.message = 'Enter your username and password.'; return; }
    this.busy = true; this.message = '';
    try {
      if (await this.auth.login(this.username, this.password)) await this.router.navigate(['/home']);
      else this.message = 'The username or password is incorrect.';
    } catch { this.message = 'Login could not access the encrypted local database.'; }
    finally { this.busy = false; this.changeDetector.markForCheck(); }
  }
}
