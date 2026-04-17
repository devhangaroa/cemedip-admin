import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { TrainingAttemptResult, AnswerResponseData } from '@core/models/training.model';

@Injectable()
export class TrainingSessionService implements OnDestroy {
  readonly secondsElapsed = signal(0);
  readonly answeredResult = signal<AnswerResponseData | null>(null);
  readonly finishResult = signal<TrainingAttemptResult | null>(null);
  readonly showResultModal = signal(false);

  private timerInterval?: ReturnType<typeof setInterval>;

  readonly formattedTime = computed(() => {
    const minutes = Math.floor(this.secondsElapsed() / 60);
    const seconds = this.secondsElapsed() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.secondsElapsed.update((s) => s + 1);
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  reset(): void {
    this.stopTimer();
    this.secondsElapsed.set(0);
    this.answeredResult.set(null);
    this.finishResult.set(null);
    this.showResultModal.set(false);
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
