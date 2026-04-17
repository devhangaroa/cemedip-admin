import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ProgressCardComponent } from './progress-card';

describe('ProgressCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressCardComponent],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(ProgressCardComponent);
    const component = fixture.componentInstance;

    return { fixture, component };
  }

  it('should create', () => {
    const { component, fixture } = createComponent();
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('date', '01/01/2026');
    fixture.componentRef.setInput('percentage', 50);
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  it('should display accuracy percentage in text', () => {
    const { fixture } = createComponent();
    fixture.componentRef.setInput('title', 'EXAMEN DE PRÁCTICA');
    fixture.componentRef.setInput('date', '13/04/2026');
    fixture.componentRef.setInput('percentage', '25.00');

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('25.00%');
  });

  it('should use progress input for bar value when provided', () => {
    const { component, fixture } = createComponent();
    fixture.componentRef.setInput('title', 'EXAMEN DE PRÁCTICA');
    fixture.componentRef.setInput('date', '13/04/2026');
    fixture.componentRef.setInput('percentage', '20.00');
    fixture.componentRef.setInput('progress', 100);

    fixture.detectChanges();

    expect(component.progressValue()).toBe(100);
  });

  it('should display custom date label when provided', () => {
    const { fixture } = createComponent();
    fixture.componentRef.setInput('title', 'EXAMEN DE PRÁCTICA');
    fixture.componentRef.setInput('date', '13/04/2026');
    fixture.componentRef.setInput('percentage', '25.00');
    fixture.componentRef.setInput('dateLabel', 'COMPLETADO');

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('COMPLETADO: 13/04/2026');
  });

  it('should emit action event when action button is clicked', () => {
    const { component, fixture } = createComponent();
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('date', '01/01/2026');
    fixture.componentRef.setInput('percentage', 50);
    fixture.componentRef.setInput('actionLabel', 'VER MÁS');
    fixture.detectChanges();

    const emitSpy = vi.fn();
    component.actionClick.subscribe(emitSpy);

    const button = fixture.nativeElement.querySelector('p-button');
    expect(button).toBeTruthy();

    button.click();

    expect(emitSpy).toHaveBeenCalled();
  });

  it('should render action button when actionLabel is provided', () => {
    const { fixture } = createComponent();
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('date', '01/01/2026');
    fixture.componentRef.setInput('percentage', 50);
    fixture.componentRef.setInput('actionLabel', 'VER MÁS');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('p-button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('VER MÁS');
  });
});
