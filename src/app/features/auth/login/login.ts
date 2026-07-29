import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading      = signal(false);
  readonly error        = signal('');
  readonly errors       = signal<string[]>([]);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    phone:    ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { phone, password } = this.form.getRawValue();
    this.auth.login(phone, password).subscribe({
      next: () => {
        const dest = this.auth.isSuperAdmin() ? '/admin/dashboard' : '/app/dashboard';
        this.router.navigate([dest]);
      },
      error: (err) => {
        const body = err.error ?? {};
        this.error.set(body.message ?? 'Erreur de connexion');
        this.errors.set(Array.isArray(body.errors) ? body.errors : []);
        this.loading.set(false);
      },
    });
  }
}
