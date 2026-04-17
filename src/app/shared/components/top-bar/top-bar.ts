import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-top-bar',
  imports: [ButtonModule, MenuModule],
  template: `
    <header class="bg-primary flex h-16 items-center justify-between px-4 shadow-md">
      <div class="flex items-center">
        <p-button
          icon="pi pi-bars"
          variant="text"
          rounded
          severity="contrast"
          aria-label="Menú principal"
          (click)="menu.toggle($event)"
          [pt]="{
            root: { class: 'app-text-on-brand hover:bg-white/10 border-none shadow-none' },
          }"
        />
        <p-menu
          #menu
          [model]="items"
          [popup]="true"
          [pt]="{
            root: { class: 'rounded-2xl border-none shadow-lg' },
            list: { class: 'p-2' },
            itemLink: { class: 'px-4 py-3 rounded-xl transition-all hover:bg-surface-50' },
            itemIcon: { class: 'text-primary' },
            itemLabel: { class: 'font-medium text-surface-700' },
          }"
        />
      </div>

      <div class="flex items-center gap-1">
        <p-button
          icon="pi pi-user"
          variant="text"
          rounded
          severity="contrast"
          aria-label="Perfil de usuario"
          (click)="userMenu.toggle($event)"
          [pt]="{
            root: { class: 'app-text-on-brand hover:bg-white/10 border-none shadow-none' },
          }"
        />
        <p-menu
          #userMenu
          [model]="userItems"
          [popup]="true"
          [pt]="{
            root: { class: 'rounded-2xl border-none shadow-lg' },
            list: { class: 'p-2' },
            itemLink: { class: 'px-4 py-3 rounded-xl transition-all hover:bg-surface-50' },
            itemIcon: { class: 'text-primary' },
            itemLabel: { class: 'font-medium text-surface-700' },
          }"
        />
        <p-button
          icon="pi pi-sign-out"
          variant="text"
          rounded
          severity="contrast"
          aria-label="Cerrar sesión"
          (click)="logout()"
          [pt]="{
            root: { class: 'app-text-on-brand hover:bg-white/10 border-none shadow-none' },
          }"
        />
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected readonly items: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      command: () => this.router.navigate(['/home']),
    },
    {
      label: 'Training',
      icon: 'pi pi-pencil',
      command: () => this.router.navigate(['/training']),
    },
    {
      label: 'Historial',
      icon: 'pi pi-history',
      command: () => this.router.navigate(['/training/history']),
    },
  ];

  protected readonly userItems: MenuItem[] = [
    {
      label: 'Mi Perfil',
      icon: 'pi pi-user',
    },
    {
      label: 'Ajustes',
      icon: 'pi pi-cog',
    },
    {
      separator: true,
    },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  logout(): void {
    this.authService.logout();
  }
}
