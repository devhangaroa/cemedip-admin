import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TopBarComponent } from '@shared/components/top-bar/top-bar';
import { ActionCardComponent } from './components/action-card/action-card';
import { ProgressCardComponent } from '@shared/components/progress-card/progress-card';
import { TrainingService } from '@features/training/services/training.service';

@Component({
  selector: 'app-home',
  imports: [TopBarComponent, ActionCardComponent, ProgressCardComponent, DatePipe],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly trainingService = inject(TrainingService);

  readonly progressResource = rxResource({
    stream: () => this.trainingService.getInProgressTrainings().pipe(map((res) => res.data)),
  });

  readonly progressItems = computed(() => {
    const data = this.progressResource.value() ?? [];
    return data.map((item) => ({
      ...item,
      title: 'TRAINING EN PROGRESO',
      specialty: 'ESPECIALIDAD', // TODO: Completar con API
      topic: 'TEMA', // TODO: Decidir si se muestra el tema y cómo se obtiene de la API
      percentage: Math.round((item.indice_pregunta_actual / item.total_preguntas) * 100),
    }));
  });

  goToTraining(): void {
    void this.router.navigate(['/training']);
  }

  resumeTraining(idIntento: number): void {
    void this.router.navigate(['/training/session', idIntento]);
  }
}
