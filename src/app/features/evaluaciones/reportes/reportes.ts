import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { EvaluacionesService } from '@core/services/evaluaciones.service';
import { ToastService } from '@core/services/toast.service';
import { ReportePregunta, ReportesFiltros } from '@core/models/evaluaciones.model';
import { extractApiErrorMessage } from '@core/models/api.model';

@Component({
  selector: 'app-reportes',
  imports: [DatePipe, ButtonModule, DialogModule, PaginatorModule],
  templateUrl: './reportes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesComponent {
  private evaluacionesService = inject(EvaluacionesService);
  private toast = inject(ToastService);

  protected readonly TABS = [
    { label: 'Sin respuesta', value: 'sin_respuesta' },
    { label: 'Solucionado', value: 'solucionado' },
    { label: 'Archivado', value: 'archivado' },
    { label: 'Todos', value: '' },
  ];

  protected readonly filtroEstado = signal('sin_respuesta');
  protected readonly pageSize = signal(10);
  private readonly filtros = signal<ReportesFiltros>({ page: 1, page_size: 10, estado: 'sin_respuesta' });

  protected readonly reportesResource = rxResource({
    params: () => this.filtros(),
    stream: ({ params }) => this.evaluacionesService.getReportes(params),
  });

  protected readonly reportes = computed(() => this.reportesResource.value()?.data ?? []);
  protected readonly paginador = computed(() => this.reportesResource.value()?.data_paginador ?? null);
  protected readonly isLoading = computed(() => this.reportesResource.isLoading());
  protected readonly totalRegistros = computed(() => this.paginador()?.total_registros ?? 0);
  protected readonly paginaActual = computed(() => ((this.paginador()?.pagina_actual ?? 1) - 1) * this.pageSize());

  protected readonly selectedIds = signal<Set<number>>(new Set());
  protected readonly modalReporte = signal<ReportePregunta | null>(null);
  protected readonly modalVisible = signal(false);
  protected readonly resolverRespuesta = signal('');
  protected readonly isResolviendo = signal(false);

  private readonly _ = effect(() => {
    const error = this.reportesResource.error() as HttpErrorResponse | null;
    if (error) this.toast.error(extractApiErrorMessage(error));
  });

  protected cambiarFiltro(estado: string) {
    this.filtroEstado.set(estado);
    this.selectedIds.set(new Set());
    this.filtros.set({ page: 1, page_size: this.pageSize(), estado: estado || undefined });
  }

  protected onPageChange(event: PaginatorState) {
    const page_size = event.rows ?? 15;
    const sizeChanged = page_size !== this.pageSize();
    const page = sizeChanged ? 1 : (event.page ?? 0) + 1;
    this.pageSize.set(page_size);
    this.filtros.update((f) => ({ ...f, page, page_size }));
  }

  protected toggleSelect(id: number) {
    const s = new Set(this.selectedIds());
    if (s.has(id)) s.delete(id); else s.add(id);
    this.selectedIds.set(s);
  }

  protected toggleSelectAll() {
    const ids = this.reportes().map((r) => r.id_reporte_pregunta);
    const allSelected = ids.length > 0 && ids.every((id) => this.selectedIds().has(id));
    this.selectedIds.set(allSelected ? new Set() : new Set(ids));
  }

  protected isSelected(id: number) { return this.selectedIds().has(id); }

  protected allSelected() {
    const ids = this.reportes().map((r) => r.id_reporte_pregunta);
    return ids.length > 0 && ids.every((id) => this.selectedIds().has(id));
  }

  protected someSelected() { return this.selectedIds().size > 0 && !this.allSelected(); }

  protected abrirModal(reporte: ReportePregunta) {
    this.modalReporte.set(reporte);
    this.resolverRespuesta.set('');
    this.modalVisible.set(true);
  }

  protected onModalHide() {
    this.modalVisible.set(false);
    this.modalReporte.set(null);
  }

  protected resolverIndividual(estado: 'solucionado' | 'archivado') {
    const r = this.modalReporte();
    if (!r || this.isResolviendo()) return;
    this.isResolviendo.set(true);
    this.evaluacionesService.resolverReporte(r.id_reporte_pregunta, estado, this.resolverRespuesta() || undefined).subscribe({
      next: (res) => {
        this.toast.success('Reporte actualizado.');
        this.modalReporte.set(res.data);
        this.isResolviendo.set(false);
        this.reportesResource.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isResolviendo.set(false);
      },
    });
  }

  protected resolverBulk(estado: 'solucionado' | 'archivado') {
    const ids = [...this.selectedIds()];
    if (!ids.length) return;
    this.evaluacionesService.resolverReportesBulk(ids, estado).subscribe({
      next: (res) => {
        this.toast.success(`${res.data.resueltos} reporte(s) actualizados.`);
        this.selectedIds.set(new Set());
        this.reportesResource.reload();
      },
      error: (err: HttpErrorResponse) => this.toast.error(extractApiErrorMessage(err)),
    });
  }

  protected nombreCompleto(r: ReportePregunta) {
    const a = r.estudiante.apellidos?.trim();
    const n = r.estudiante.nombres?.trim();
    if (a && n) return `${a}, ${n}`;
    return a || n || '(sin nombre)';
  }
}
