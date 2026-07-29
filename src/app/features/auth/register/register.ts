import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class RegisterComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading      = signal(false);
  readonly error        = signal('');
  readonly errors       = signal<string[]>([]);
  readonly step         = signal<1 | 2>(1);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    company_name:  ['', [Validators.required, Validators.minLength(2)]],
    company_phone: ['', [Validators.required]],
    company_email: [''],
    company_ifu:   [''],
    company_rccm:  [''],
    first_name:    ['', [Validators.required, Validators.minLength(2)]],
    last_name:     ['', [Validators.required, Validators.minLength(2)]],
    phone:         ['', [Validators.required]],
    password:      ['', [Validators.required, Validators.minLength(8)]],
  });

  nextStep() {
    const { company_name, company_phone } = this.form.controls;
    if (company_name.invalid || company_phone.invalid) {
      company_name.markAsTouched();
      company_phone.markAsTouched();
      return;
    }
    this.step.set(2);
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: (err) => {
        const body = err.error ?? {};
        this.error.set(body.message ?? 'Erreur lors de l\'inscription');
        this.errors.set(Array.isArray(body.errors) ? body.errors : []);
        this.loading.set(false);
      },
    });
  }
}
