
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-login',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="login-page">

      <a class="brand" routerLink="/">
        <span class="brand-mark">s.</span>
        <span>
          seenjaba
          <small>ADMINISTRATION</small>
        </span>
      </a>

      <section class="login-card">

        <div class="login-icon">🔐</div>

        <span class="eyebrow">ESPACE SÉCURISÉ</span>

        <h1>Bienvenue</h1>

        <p class="subtitle">
          Connectez-vous pour accéder à votre espace d'administration.
        </p>

        <form (ngSubmit)="login()">

          <label for="email">Adresse e-mail</label>

          <input
            id="email"
            type="email"
            name="email"
            [(ngModel)]="email"
            placeholder="admin@seenjaba.sn"
            autocomplete="username"
            required
          >

          <label for="password">Mot de passe</label>

          <div class="password-field">

            <input
              id="password"
              [type]="showPassword() ? 'text' : 'password'"
              name="password"
              [(ngModel)]="password"
              placeholder="Votre mot de passe"
              autocomplete="current-password"
              required
            >

            <button
              type="button"
              class="show-password"
              (click)="togglePasswordVisibility()"
            >
              {{ showPassword() ? 'Masquer' : 'Afficher' }}
            </button>

          </div>

          @if (errorMessage()) {
            <div class="error-message">
              {{ errorMessage() }}
            </div>
          }

          <button
            type="submit"
            class="login-button"
            [disabled]="loading() || !email.trim() || !password"
          >
            @if (loading()) {
              Connexion en cours...
            } @else {
              Se connecter <span>→</span>
            }
          </button>

        </form>

        <div class="security-note">
          <span>●</span>
          Connexion réservée aux administrateurs autorisés.
        </div>

      </section>

      <footer>
        <span>seenjaba Admin · © {{ currentYear }}</span>
        <a routerLink="/">Retour à la boutique</a>
      </footer>

    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .login-page {
      min-height: 100vh;
      box-sizing: border-box;
      padding: 38px 20px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      background: #faf8f3;
      color: #2A55D8;
      font-family: inherit;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 11px;
      color: #2A55D8;
      text-decoration: none;
      font-size: 23px;
      font-weight: 800;
      letter-spacing: -1px;
    }

    .brand-mark {
      width: 43px;
      height: 43px;
      display: grid;
      place-items: center;
      border-radius: 13px;
      background: #f56624;
      color: white;
      font-size: 25px;
    }

    .brand small {
      display: block;
      margin-top: 2px;
      font-size: 9px;
      letter-spacing: 2px;
      color: #87918a;
    }

    .login-card {
      width: min(100%, 440px);
      box-sizing: border-box;
      padding: 38px;
      background: white;
      border: 1px solid #eeeee8;
      border-radius: 22px;
      box-shadow: 0 18px 55px rgba(23, 61, 50, .07);
    }

    .login-icon {
      width: 54px;
      height: 54px;
      display: grid;
      place-items: center;
      border-radius: 16px;
      background: #fff1e9;
      font-size: 25px;
      margin-bottom: 25px;
    }

    .eyebrow {
      color: #f56624;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 2px;
    }

    h1 {
      margin: 10px 0;
      font-size: 32px;
      letter-spacing: -1.3px;
    }

    .subtitle {
      margin: 0 0 30px;
      color: #7b857f;
      font-size: 14px;
      line-height: 1.7;
    }

    label {
      display: block;
      margin: 19px 0 9px;
      font-size: 12px;
      font-weight: 700;
    }

    input {
      width: 100%;
      height: 49px;
      box-sizing: border-box;
      padding: 0 14px;
      border: 1px solid #e7e9e4;
      border-radius: 10px;
      outline: none;
      background: #fdfdfb;
      color: #2A55D8;
      font: inherit;
      font-size: 13px;
    }

    input:focus {
      border-color: #f56624;
      box-shadow: 0 0 0 3px rgba(245, 102, 36, .09);
    }

    .password-field {
      position: relative;
    }

    .password-field input {
      padding-right: 90px;
    }

    .show-password {
      position: absolute;
      top: 0;
      right: 10px;
      height: 49px;
      border: 0;
      background: transparent;
      color: #f56624;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }

    .login-button {
      width: 100%;
      height: 51px;
      margin-top: 25px;
      border: 0;
      border-radius: 10px;
      background: #2A55D8;
      color: white;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: background .2s;
    }

    .login-button:hover {
      background: #245443;
    }

    .login-button:disabled {
      opacity: .6;
      cursor: not-allowed;
    }

    .login-button span {
      margin-left: 8px;
    }

    .error-message {
      margin-top: 17px;
      padding: 12px;
      border-radius: 9px;
      background: #fff0ed;
      color: #bd3d2b;
      font-size: 12px;
      line-height: 1.5;
    }

    .security-note {
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #f0f0ec;
      color: #89918c;
      font-size: 10px;
      text-align: center;
    }

    .security-note span {
      color: #27a36b;
      margin-right: 5px;
    }

    footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      color: #9aa19c;
      font-size: 11px;
    }

    footer a {
      color: #2A55D8;
      text-decoration: none;
      font-weight: 700;
    }

    @media (max-width: 480px) {
      .login-page {
        padding: 28px 16px 20px;
      }

      .login-card {
        padding: 27px 22px;
      }

      h1 {
        font-size: 28px;
      }
    }
  `]
})
export class AdminLoginComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';

  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  currentYear = new Date().getFullYear();

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  async login(): Promise<void> {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    try {
      await this.auth.signIn(
        this.email.trim(),
        this.password
      );

      await this.router.navigateByUrl('/admin');

    } catch (error) {
      this.errorMessage.set(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue pendant la connexion.'
      );

    } finally {
      this.loading.set(false);
    }
  }
}
