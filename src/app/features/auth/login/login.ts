import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { of, tap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { LogoComponent } from '@shared/components/logo/logo';
import { AuthShellComponent } from '@shared/components/auth-shell/auth-shell';
import { FormFieldComponent } from '@shared/components/form-field/form-field';
import { AuthService } from '@core/services/auth.service';
import { LoginRequest } from '@core/models/auth.model';
import { extractApiErrorMessage } from '@core/models/api.model';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    LogoComponent,
    FormFieldComponent,
    AuthShellComponent,
  ],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  protected readonly loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  private readonly loginTrigger = signal<LoginRequest | null>(null);

  protected readonly loginResource = rxResource({
    params: () => this.loginTrigger(),
    stream: ({ params: credentials }) => {
      if (!credentials) return of(null);
      return this.authService.login(credentials).pipe(
        tap((response) => {
          if (response.status === 'success') {
            void this.router.navigate(['/home']);
          }
        }),
      );
    },
  });

  protected readonly isLoading = computed(() => this.loginResource.isLoading());

  protected readonly errorMessage = computed(() => {
    const error = this.loginResource.error() as HttpErrorResponse | null | undefined;
    if (error) return extractApiErrorMessage(error);

    const value = this.loginResource.value();
    if (value && value.status === 'error') return value.message || 'Error al iniciar sesión';

    return null;
  });

  protected get username() {
    return this.loginForm.controls.username;
  }

  protected get password() {
    return this.loginForm.controls.password;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.getRawValue();
      this.loginTrigger.set({
        username,
        password,
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
