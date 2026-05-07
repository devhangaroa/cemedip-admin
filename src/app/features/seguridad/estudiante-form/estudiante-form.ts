import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';
import { SkeletonFieldComponent } from '@shared/components/skeleton-field/skeleton-field';
import { CambiarContrasenaDialogComponent } from '@shared/components/cambiar-contrasena-dialog/cambiar-contrasena-dialog';
import { SeguridadService } from '@core/services/seguridad.service';
import { CursosService } from '@core/services/cursos.service';
import { ToastService } from '@core/services/toast.service';
import { extractApiErrorMessage } from '@core/models/api.model';
import { EstudianteCreateInput, EstudianteDetalle } from '@core/models/seguridad.model';
import { Curso } from '@core/models/cursos.model';

@Component({
  selector: 'app-estudiante-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    DatePickerModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    PaginatorModule,
    ConfirmDialogModule,
    DialogModule,
    SkeletonFieldComponent,
    CambiarContrasenaDialogComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './estudiante-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstudianteFormComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seguridadService = inject(SeguridadService);
  private cursosService = inject(CursosService);
  private confirmationService = inject(ConfirmationService);
  private toast = inject(ToastService);

  protected readonly estadoLabels: Record<string, string> = {
    sin_iniciar: 'Sin Iniciar',
    en_curso: 'En Curso',
    finalizado: 'Finalizado',
  };
  protected readonly estadoClasses: Record<string, string> = {
    sin_iniciar: 'bg-gray-100 text-gray-700',
    en_curso: 'bg-blue-100 text-blue-700',
    finalizado: 'bg-green-100 text-green-700',
  };

  protected readonly tipoIdentificacionOpciones = [
    { label: 'Cédula', value: 'cedula' },
    { label: 'Pasaporte', value: 'pasaporte' },
  ];

  protected readonly generoOpciones = [
    { label: 'Masculino', value: 'masculino' },
    { label: 'Femenino', value: 'femenino' },
    { label: 'Otro', value: 'otro' },
  ];

  protected readonly idEstudiante = signal<number | null>(null);
  protected readonly estudiante = signal<EstudianteDetalle | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isToggling = signal(false);
  protected readonly dialogContrasenaVisible = signal(false);
  protected readonly isSavingContrasena = signal(false);

  protected readonly esNuevo = computed(() => this.idEstudiante() === null);
  protected readonly isActive = computed(() => this.estudiante()?.is_active ?? true);
  protected readonly formSubmitted = signal(false);
  protected readonly usernameDisplay = signal('');

  protected readonly skeletonFields = Array.from({ length: 10 });

  // --- Cursos inscritos ---
  private readonly cursosFiltros = signal<{ page: number; page_size: number }>({ page: 1, page_size: 10 });

  protected readonly cursosInscritosResource = rxResource({
    params: () => {
      const id = this.idEstudiante();
      if (!id) return undefined;
      return { id, ...this.cursosFiltros() };
    },
    stream: ({ params }) =>
      this.cursosService.getCursosDeEstudiante(params.id, {
        page: params.page,
        page_size: params.page_size,
      }),
  });

  protected readonly cursosInscritos = computed(() => this.cursosInscritosResource.value()?.data ?? []);
  protected readonly cursosPaginador = computed(() => this.cursosInscritosResource.value()?.data_paginador ?? null);
  protected readonly isLoadingCursos = computed(() => this.cursosInscritosResource.isLoading());
  protected readonly totalCursos = computed(() => this.cursosPaginador()?.total_registros ?? 0);
  protected readonly cursosPageSize = signal(10);
  protected readonly cursosPaginaActual = computed(
    () => ((this.cursosPaginador()?.pagina_actual ?? 1) - 1) * this.cursosPageSize(),
  );

  private readonly _errCursos = effect(() => {
    const error = this.cursosInscritosResource.error() as HttpErrorResponse | null;
    if (error) this.toast.error(extractApiErrorMessage(error));
  });

  onCursosPageChange(event: PaginatorState) {
    const page_size = event.rows ?? 10;
    const sizeChanged = page_size !== this.cursosPageSize();
    const page = sizeChanged ? 1 : (event.page ?? 0) + 1;
    this.cursosPageSize.set(page_size);
    this.cursosFiltros.update((f) => ({ ...f, page, page_size }));
  }

  confirmarDesinscribirCurso(idInscripcion: number, idCurso: number, nombreCurso: string) {
    this.confirmationService.confirm({
      message: `¿Desea quitar al estudiante del curso <strong>${nombreCurso}</strong>?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, quitar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.cursosService.desinscribirEstudiante(idCurso, idInscripcion).subscribe({
          next: () => {
            this.toast.success(`Estudiante removido del curso "${nombreCurso}".`);
            this.cursosInscritosResource.reload();
          },
          error: (err: HttpErrorResponse) => this.toast.error(extractApiErrorMessage(err)),
        });
      },
    });
  }

  // --- Dialog agregar curso ---
  protected readonly dialogCursosVisible = signal(false);
  protected readonly dialogCursosBuscarForm = this.fb.group({ nombre: [''], codigo: [''] });
  protected readonly dialogCursosResultados = signal<Curso[]>([]);
  protected readonly isLoadingDialogCursos = signal(false);
  protected readonly inscribiendoCursoIds = signal(new Set<number>());

  abrirDialogCursos() {
    this.dialogCursosBuscarForm.reset();
    this.dialogCursosResultados.set([]);
    this.dialogCursosVisible.set(true);
    this.buscarCursosEnDialog();
  }

  buscarCursosEnDialog() {
    const { nombre, codigo } = this.dialogCursosBuscarForm.getRawValue();
    this.isLoadingDialogCursos.set(true);
    this.cursosService
      .getCursos({ page: 1, page_size: 20, nombre: nombre || undefined, codigo: codigo || undefined, es_activo: true })
      .subscribe({
        next: (res) => {
          this.dialogCursosResultados.set(res.data ?? []);
          this.isLoadingDialogCursos.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(extractApiErrorMessage(err));
          this.isLoadingDialogCursos.set(false);
        },
      });
  }

  inscribirEnCurso(idCurso: number) {
    const id = this.idEstudiante();
    if (!id) return;
    this.inscribiendoCursoIds.update((s) => new Set([...s, idCurso]));
    this.cursosService.inscribirEstudiante(idCurso, id).subscribe({
      next: () => {
        this.inscribiendoCursoIds.update((s) => { const n = new Set(s); n.delete(idCurso); return n; });
        this.toast.success('Estudiante inscrito correctamente.');
        this.cursosInscritosResource.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.inscribiendoCursoIds.update((s) => { const n = new Set(s); n.delete(idCurso); return n; });
        this.toast.error(extractApiErrorMessage(err));
      },
    });
  }

  protected ctrl(name: string) {
    return this.form.get(name)!;
  }

  protected fieldInvalid(name: string): boolean {
    const c = this.ctrl(name);
    return c.invalid && (c.touched || c.dirty || this.formSubmitted());
  }

  protected readonly form = this.fb.group({
    tipo_identificacion: ['cedula'],
    identificacion: [''],
    nombres: [''],
    apellidos: [''],
    correo_institucional: ['', [Validators.required, Validators.email]],
    correo_personal: [''],
    telefono_convencional: [''],
    telefono_celular: [''],
    universidad: [''],
    direccion: [''],
    fecha_nacimiento: [null as Date | null],
    genero: [null as string | null],
    username: [''],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idEstudiante.set(+id);
      this.cargarEstudiante(+id);
    }
    this.form.get('username')!.valueChanges.subscribe(v => this.usernameDisplay.set(v ?? ''));
  }

  private cargarEstudiante(id: number) {
    this.isLoading.set(true);
    this.seguridadService.getEstudiante(id).subscribe({
      next: (res) => {
        const e = res.data;
        this.estudiante.set(e);
        this.usernameDisplay.set(e.username);
        this.form.patchValue({
          tipo_identificacion: e.tipo_identificacion ?? 'cedula',
          identificacion: e.identificacion ?? '',
          nombres: e.nombres ?? '',
          apellidos: e.apellidos ?? '',
          correo_institucional: e.correo_institucional,
          correo_personal: e.correo_personal ?? '',
          telefono_convencional: e.telefono_convencional ?? '',
          telefono_celular: e.telefono_celular ?? '',
          universidad: e.universidad ?? '',
          direccion: e.direccion ?? '',
          fecha_nacimiento: e.fecha_nacimiento ? new Date(e.fecha_nacimiento) : null,
          genero: e.genero ?? null,
          username: e.username,
        });
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isLoading.set(false);
      },
    });
  }

  guardar() {
    this.formSubmitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isSaving()) return;
    this.isSaving.set(true);

    const raw = this.form.getRawValue();
    const id = this.idEstudiante();

    const payload = {
      tipo_identificacion: raw.tipo_identificacion || null,
      identificacion: raw.identificacion || null,
      nombres: raw.nombres || null,
      apellidos: raw.apellidos || null,
      correo_personal: raw.correo_personal || null,
      telefono_convencional: raw.telefono_convencional || null,
      telefono_celular: raw.telefono_celular || null,
      universidad: raw.universidad || null,
      direccion: raw.direccion || null,
      fecha_nacimiento: raw.fecha_nacimiento ? this.formatDate(raw.fecha_nacimiento) : null,
      genero: raw.genero || null,
      // correo_institucional solo al crear (se convierte en username)
      ...(id === null
        ? { correo_institucional: raw.correo_institucional }
        : { username: raw.username || null }),
    };

    const req = id
      ? this.seguridadService.actualizarEstudiante(id, payload)
      : this.seguridadService.crearEstudiante(payload as EstudianteCreateInput);

    req.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (!id) {
          this.toast.success('Estudiante creado correctamente.');
          this.router.navigate(['/seguridad/estudiantes', res.data.id_estudiante]);
        } else {
          this.estudiante.set(res.data);
          this.toast.success('Datos guardados correctamente.');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isSaving.set(false);
      },
    });
  }

  toggleActivo() {
    const id = this.idEstudiante();
    if (!id || this.isToggling()) return;
    this.isToggling.set(true);

    const activo = this.isActive();
    const req = activo
      ? this.seguridadService.inactivarEstudiante(id)
      : this.seguridadService.activarEstudiante(id);

    req.subscribe({
      next: () => {
        this.estudiante.update((e) => (e ? { ...e, is_active: !activo } : e));
        this.toast.success(activo ? 'Estudiante desactivado.' : 'Estudiante activado.');
        this.isToggling.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isToggling.set(false);
      },
    });
  }

  cambiarContrasena(nuevaContrasena: string) {
    const id = this.idEstudiante();
    if (!id || this.isSavingContrasena()) return;
    this.isSavingContrasena.set(true);
    this.seguridadService.cambiarContrasenaEstudiante(id, nuevaContrasena).subscribe({
      next: () => {
        this.isSavingContrasena.set(false);
        this.dialogContrasenaVisible.set(false);
        this.toast.success('Contraseña actualizada correctamente.');
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isSavingContrasena.set(false);
      },
    });
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
