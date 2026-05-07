import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { PaginatorState } from 'primeng/paginator';
import { ConfirmationService } from 'primeng/api';
import { CursosService } from '@core/services/cursos.service';
import { SeguridadService } from '@core/services/seguridad.service';
import { ToastService } from '@core/services/toast.service';
import { EstudiantesInscritosFiltros } from '@core/models/cursos.model';
import { Estudiante, EstudiantesFiltros } from '@core/models/seguridad.model';
import { extractApiErrorMessage } from '@core/models/api.model';

@Component({
  selector: 'app-curso-detalle',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    PaginatorModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './curso-detalle.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CursoDetalleComponent {
  private route = inject(ActivatedRoute);
  private cursosService = inject(CursosService);
  private seguridadService = inject(SeguridadService);
  private fb = inject(NonNullableFormBuilder);
  private confirmationService = inject(ConfirmationService);
  private toast = inject(ToastService);

  private readonly idCurso = signal(Number(this.route.snapshot.paramMap.get('id')));

  // --- Datos del curso ---
  protected readonly cursoResource = rxResource({
    params: () => this.idCurso(),
    stream: ({ params: id }) => this.cursosService.getCurso(id),
  });
  protected readonly curso = computed(() => this.cursoResource.value()?.data ?? null);
  protected readonly isCursoLoading = computed(() => this.cursoResource.isLoading());

  private readonly _errCurso = effect(() => {
    const error = this.cursoResource.error() as HttpErrorResponse | null;
    if (error) this.toast.error(extractApiErrorMessage(error));
  });

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

  // --- Estudiantes inscritos ---
  protected readonly inscritosFiltrosForm = this.fb.group({
    nombres: [''],
    apellidos: [''],
    identificacion: [''],
  });

  private readonly inscritosFiltros = signal<EstudiantesInscritosFiltros>({ page: 1, page_size: 10 });

  protected readonly inscritosResource = rxResource({
    params: () => ({ idCurso: this.idCurso(), filtros: this.inscritosFiltros() }),
    stream: ({ params }) => this.cursosService.getEstudiantesInscritos(params.idCurso, params.filtros),
  });

  protected readonly inscritos = computed(() => this.inscritosResource.value()?.data ?? []);
  protected readonly inscritosPaginador = computed(() => this.inscritosResource.value()?.data_paginador ?? null);
  protected readonly isLoadingInscritos = computed(() => this.inscritosResource.isLoading());
  protected readonly totalInscritos = computed(() => this.inscritosPaginador()?.total_registros ?? 0);
  protected readonly inscritosPageSize = signal(10);
  protected readonly inscritosPaginaActual = computed(
    () => ((this.inscritosPaginador()?.pagina_actual ?? 1) - 1) * this.inscritosPageSize(),
  );

  private readonly _errInscritos = effect(() => {
    const error = this.inscritosResource.error() as HttpErrorResponse | null;
    if (error) this.toast.error(extractApiErrorMessage(error));
  });

  buscarInscritos() {
    const { nombres, apellidos, identificacion } = this.inscritosFiltrosForm.getRawValue();
    this.inscritosFiltros.set({
      page: 1,
      page_size: this.inscritosPageSize(),
      nombres: nombres || undefined,
      apellidos: apellidos || undefined,
      identificacion: identificacion || undefined,
    });
  }

  limpiarInscritos() {
    this.inscritosFiltrosForm.reset();
    this.inscritosPageSize.set(10);
    this.inscritosFiltros.set({ page: 1, page_size: 10 });
  }

  onInscritosPageChange(event: PaginatorState) {
    const page_size = event.rows ?? 10;
    const sizeChanged = page_size !== this.inscritosPageSize();
    const page = sizeChanged ? 1 : (event.page ?? 0) + 1;
    this.inscritosPageSize.set(page_size);
    this.inscritosFiltros.update((f) => ({ ...f, page, page_size }));
  }

  confirmarDesinscribir(idInscripcion: number, nombre: string) {
    this.confirmationService.confirm({
      message: `¿Desea quitar a <strong>${nombre}</strong> de este curso?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, quitar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.cursosService.desinscribirEstudiante(this.idCurso(), idInscripcion).subscribe({
          next: () => {
            this.toast.success(`${nombre} ha sido removido del curso.`);
            this.inscritosResource.reload();
          },
          error: (err: HttpErrorResponse) => this.toast.error(extractApiErrorMessage(err)),
        });
      },
    });
  }

  // --- Diálogo agregar estudiante ---
  protected readonly dialogVisible = signal(false);

  protected readonly dialogBuscarForm = this.fb.group({
    nombres: [''],
    apellidos: [''],
  });

  protected readonly dialogResultados = signal<Estudiante[]>([]);
  protected readonly isLoadingDialog = signal(false);
  protected readonly inscribiendoIds = signal(new Set<number>());

  abrirDialog() {
    this.dialogBuscarForm.reset();
    this.dialogResultados.set([]);
    this.dialogVisible.set(true);
    this.buscarEnDialog();
  }

  cerrarDialog() {
    this.dialogVisible.set(false);
  }

  buscarEnDialog() {
    const { nombres, apellidos } = this.dialogBuscarForm.getRawValue();
    const filtros: EstudiantesFiltros = {
      page: 1,
      page_size: 20,
      nombres: nombres || undefined,
      apellidos: apellidos || undefined,
    };
    this.isLoadingDialog.set(true);
    this.seguridadService.getEstudiantes(filtros).subscribe({
      next: (res) => {
        this.dialogResultados.set(res.data ?? []);
        this.isLoadingDialog.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isLoadingDialog.set(false);
      },
    });
  }

  inscribir(idEstudiante: number) {
    this.inscribiendoIds.update((s) => new Set([...s, idEstudiante]));
    this.cursosService.inscribirEstudiante(this.idCurso(), idEstudiante).subscribe({
      next: () => {
        this.inscribiendoIds.update((s) => {
          const n = new Set(s);
          n.delete(idEstudiante);
          return n;
        });
        this.toast.success('Estudiante inscrito correctamente.');
        this.inscritosResource.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.inscribiendoIds.update((s) => {
          const n = new Set(s);
          n.delete(idEstudiante);
          return n;
        });
        this.toast.error(extractApiErrorMessage(err));
      },
    });
  }
}
