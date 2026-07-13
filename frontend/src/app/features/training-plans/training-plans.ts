import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LucideAngularModule, CalendarClock, Circle, CircleCheck, Trash2 } from 'lucide-angular';
import { Player, PlayerService } from '../../core/player.service';
import { Session, SessionService } from '../../core/session.service';

@Component({
  selector: 'app-training-plans',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './training-plans.html',
  styleUrl: './training-plans.scss',
})
export class TrainingPlans implements OnInit {
  readonly icons = { CalendarClock, Circle, CircleCheck, Trash2 };

  sessions = signal<Session[]>([]);
  players = signal<Map<string, Player>>(new Map());
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor(
    private sessionService: SessionService,
    private playerService: PlayerService,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.errorMessage.set(null);
    forkJoin({
      sessions: this.sessionService.listAll(),
      players: this.playerService.list(),
    }).subscribe({
      next: ({ sessions, players }) => {
        this.sessions.set(sessions);
        this.players.set(new Map(players.map((p) => [p.id, p])));
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load the training schedule.');
        this.loading.set(false);
      },
    });
  }

  get upcoming(): Session[] {
    return this.sessions()
      .filter((s) => s.status === 'upcoming')
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }

  get completed(): Session[] {
    return this.sessions()
      .filter((s) => s.status === 'completed')
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }

  playerFor(session: Session): Player | undefined {
    return this.players().get(session.playerId);
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  toggleSession(session: Session) {
    const nextStatus = session.status === 'upcoming' ? 'completed' : 'upcoming';
    this.sessionService.updateStatus(session.id, nextStatus).subscribe({
      next: (updated) => {
        this.sessions.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
      },
      error: () => {
        this.errorMessage.set('Could not update that session.');
      },
    });
  }

  deleteSession(session: Session, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.sessionService.delete(session.id).subscribe({
      next: () => {
        this.sessions.update((list) => list.filter((s) => s.id !== session.id));
      },
      error: () => {
        this.errorMessage.set('Could not delete that session.');
      },
    });
  }
}
