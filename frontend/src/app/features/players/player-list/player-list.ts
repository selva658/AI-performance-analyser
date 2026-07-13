import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Users, Plus, Search, Trash2, ArrowRight } from 'lucide-angular';
import { Player, PlayerService } from '../../../core/player.service';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './player-list.html',
  styleUrl: './player-list.scss',
})
export class PlayerList implements OnInit {
  readonly icons = { Users, Plus, Search, Trash2, ArrowRight };

  players = signal<Player[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  saving = signal(false);

  searchTerm = '';
  showAddForm = false;

  newPlayer = {
    name: '',
    age: null as number | null,
    team: '',
    position: '',
    notes: '',
    email: '',
    password: '',
  };

  constructor(private playerService: PlayerService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.playerService.list().subscribe({
      next: (players) => {
        this.players.set(players);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.error || 'Could not load players.');
        this.loading.set(false);
      },
    });
  }

  get filteredPlayers(): Player[] {
    const term = this.searchTerm.trim().toLowerCase();
    const players = this.players();
    if (!term) return players;
    return players.filter((p) =>
      [p.name, p.team, p.position].some((field) => field?.toLowerCase().includes(term)),
    );
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  addPlayer() {
    if (!this.newPlayer.name.trim()) return;

    this.saving.set(true);
    this.playerService.create(this.newPlayer).subscribe({
      next: (player) => {
        this.players.update((list) => [...list, player]);
        this.newPlayer = { name: '', age: null, team: '', position: '', notes: '', email: '', password: '' };
        this.showAddForm = false;
        this.saving.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.error || 'Could not add player.');
        this.saving.set(false);
      },
    });
  }

  deletePlayer(player: Player, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm(`Remove ${player.name} from your roster?`)) return;

    this.playerService.delete(player.id).subscribe({
      next: () => {
        this.players.update((list) => list.filter((p) => p.id !== player.id));
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.error || 'Could not delete player.');
      },
    });
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }
}
