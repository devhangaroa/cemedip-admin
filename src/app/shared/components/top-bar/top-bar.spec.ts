import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopBarComponent } from './top-bar';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { By } from '@angular/platform-browser';

describe('TopBarComponent', () => {
  let component: TopBarComponent;
  let fixture: ComponentFixture<TopBarComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBarComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(TopBarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have menu items defined', () => {
    expect(component['items'].length).toBeGreaterThan(0);
  });

  it('should toggle menu on hamburger button click', () => {
    const menu = fixture.debugElement.query(By.css('p-menu')).componentInstance;
    const toggleSpy = vi.spyOn(menu, 'toggle');
    const button = fixture.debugElement.query(By.css('p-button[icon="pi pi-bars"]'));

    button.nativeElement.click();

    expect(toggleSpy).toHaveBeenCalled();
  });

  it('should toggle user menu on profile button click', () => {
    const menus = fixture.debugElement.queryAll(By.css('p-menu'));
    const userMenu = menus[1].componentInstance;
    const toggleSpy = vi.spyOn(userMenu, 'toggle');
    const button = fixture.debugElement.query(By.css('p-button[icon="pi pi-user"]'));

    button.nativeElement.click();

    expect(toggleSpy).toHaveBeenCalled();
  });

  it('should call logout on sign-out button click', () => {
    const logoutSpy = vi.spyOn(authService, 'logout');
    const button = fixture.debugElement.query(By.css('p-button[icon="pi pi-sign-out"]'));

    button.nativeElement.click();

    expect(logoutSpy).toHaveBeenCalled();
  });
});
