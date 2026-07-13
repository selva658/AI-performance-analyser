import { Component, ChangeDetectorRef, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  LucideAngularModule,
  ArrowLeft,
  Pencil,
  Trash2,
  Video,
  ClipboardList,
  ChevronDown,
  CircleCheck,
  TriangleAlert,
  PersonStanding,
  Lightbulb,
  HeartPulse,
  Circle,
  ListChecks,
  CalendarClock,
  CalendarPlus,
  X,
  TrendingUp,
} from 'lucide-angular';
import { Player, PlayerService } from '../../../core/player.service';
import { Analysis, AnalysisService } from '../../../core/analysis.service';
import { Recommendation, RecommendationService } from '../../../core/recommendation.service';
import { Session, SessionService } from '../../../core/session.service';
import { ThemeService } from '../../../core/theme.service';
import { AuthService } from '../../../core/auth.service';

const PROGRESS_ACCENT = '#4f46e5';
const PROGRESS_BEFORE = '#a3a3ab';

const RISK_TONE: Record<string, { fill: string; tint: string }> = {
  low: { fill: '#10b981', tint: '#ecfdf5' },
  medium: { fill: '#f59e0b', tint: '#fffbeb' },
  high: { fill: '#ef4444', tint: '#fef2f2' },
};
const RISK_TONE_DEFAULT = { fill: '#8a8a94', tint: '#f7f7f8' };

@Component({
  selector: 'app-player-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, NgApexchartsModule],
  templateUrl: './player-profile.html',
  styleUrl: './player-profile.scss',
})
export class PlayerProfile implements OnInit {
  readonly icons = {
    ArrowLeft,
    Pencil,
    Trash2,
    Video,
    ClipboardList,
    ChevronDown,
    CircleCheck,
    TriangleAlert,
    PersonStanding,
    Lightbulb,
    HeartPulse,
    Circle,
    ListChecks,
    CalendarClock,
    CalendarPlus,
    X,
    TrendingUp,
  };

  player = signal<Player | null>(null);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  saving = signal(false);

  analyses = signal<Analysis[]>([]);
  analysesLoading = signal(true);
  expandedId = signal<string | null>(null);

  progressChart: any = null;
  comparisonRadar: any = null;
  scoreDelta = 0;

  recommendations = signal<Recommendation[]>([]);
  recommendationsLoading = signal(true);

  sessions = signal<Session[]>([]);
  sessionsLoading = signal(true);
  showSessionForm = false;
  savingSession = false;
  sessionForm = {
    title: '',
    scheduledAt: '',
    notes: '',
    recommendationId: null as string | null,
  };

  editing = false;
  editForm = {
    name: '',
    age: null as number | null,
    team: '',
    position: '',
    notes: '',
    email: '',
    password: '',
  };

  private id!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playerService: PlayerService,
    private analysisService: AnalysisService,
    private recommendationService: RecommendationService,
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef,
    public theme: ThemeService,
    public auth: AuthService,
  ) {
    effect(() => {
      this.theme.theme();
      if (this.analyses().length >= 2) {
        this.buildProgressCharts();
        this.cdr.detectChanges();
      }
    });
  }

  get readOnly(): boolean {
    return this.auth.role() === 'player';
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.load();
    this.loadAnalyses();
    this.loadRecommendations();
    this.loadSessions();
  }

  loadSessions() {
    this.sessionsLoading.set(true);
    this.sessionService.listForPlayer(this.id).subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);
        this.sessionsLoading.set(false);
      },
      error: () => {
        this.sessions.set([]);
        this.sessionsLoading.set(false);
      },
    });
  }

  get sortedSessions(): Session[] {
    return [...this.sessions()].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'upcoming' ? -1 : 1;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });
  }

  openSessionForm(recommendation?: Recommendation) {
    this.sessionForm = {
      title: recommendation?.text ?? '',
      scheduledAt: '',
      notes: '',
      recommendationId: recommendation?.id ?? null,
    };
    this.showSessionForm = true;
  }

  cancelSessionForm() {
    this.showSessionForm = false;
  }

  saveSession() {
    if (!this.sessionForm.title.trim() || !this.sessionForm.scheduledAt) return;

    this.savingSession = true;
    this.sessionService
      .create({
        playerId: this.id,
        title: this.sessionForm.title,
        scheduledAt: new Date(this.sessionForm.scheduledAt).toISOString(),
        notes: this.sessionForm.notes,
        recommendationId: this.sessionForm.recommendationId,
      })
      .subscribe({
        next: (session) => {
          this.sessions.update((list) => [...list, session]);
          this.showSessionForm = false;
          this.savingSession = false;
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.error || 'Could not schedule that session.');
          this.savingSession = false;
        },
      });
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

  loadRecommendations() {
    this.recommendationsLoading.set(true);
    this.recommendationService.listForPlayer(this.id).subscribe({
      next: (recommendations) => {
        this.recommendations.set(recommendations);
        this.recommendationsLoading.set(false);
      },
      error: () => {
        this.recommendations.set([]);
        this.recommendationsLoading.set(false);
      },
    });
  }

  get pendingCount(): number {
    return this.recommendations().filter((r) => r.status === 'pending').length;
  }

  get sortedRecommendations(): Recommendation[] {
    return [...this.recommendations()].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  toggleRecommendation(rec: Recommendation) {
    const nextStatus = rec.status === 'pending' ? 'done' : 'pending';
    this.recommendationService.updateStatus(rec.id, nextStatus).subscribe({
      next: (updated) => {
        this.recommendations.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
      },
      error: () => {
        this.errorMessage.set('Could not update that recommendation.');
      },
    });
  }

  deleteRecommendation(rec: Recommendation, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.recommendationService.delete(rec.id).subscribe({
      next: () => {
        this.recommendations.update((list) => list.filter((r) => r.id !== rec.id));
      },
      error: () => {
        this.errorMessage.set('Could not delete that recommendation.');
      },
    });
  }

  loadAnalyses() {
    this.analysesLoading.set(true);
    this.analysisService.listForPlayer(this.id).subscribe({
      next: (analyses) => {
        this.analyses.set(analyses);
        this.analysesLoading.set(false);
        if (analyses.length >= 2) {
          this.buildProgressCharts();
        }
      },
      error: () => {
        this.analyses.set([]);
        this.analysesLoading.set(false);
      },
    });
  }

  buildProgressCharts() {
    const oldestFirst = [...this.analyses()].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const first = oldestFirst[0];
    const latest = oldestFirst[oldestFirst.length - 1];
    this.scoreDelta = latest.report.metrics.overall_score - first.report.metrics.overall_score;

    const dark = this.theme.theme() === 'dark';
    const axisLabel = dark ? '#c3c2c9' : '#585866';
    const gridLine = dark ? '#2b2b33' : '#e5e5ea';
    const ringFills = dark ? ['#1c1c22', '#17171c'] : ['#fafafa', '#ffffff'];
    const markerStroke = dark ? '#17171c' : '#ffffff';

    this.progressChart = {
      series: [
        {
          name: 'Overall Score',
          data: oldestFirst.map((a) => ({
            x: new Date(a.createdAt).getTime(),
            y: a.report.metrics.overall_score,
          })),
        },
      ],
      chart: {
        type: 'area',
        height: 220,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      xaxis: {
        type: 'datetime',
        labels: { style: { colors: axisLabel, fontSize: '11px' } },
        axisBorder: { color: gridLine },
        axisTicks: { color: gridLine },
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: { style: { colors: [axisLabel], fontSize: '11px' } },
      },
      grid: { borderColor: gridLine, strokeDashArray: 0 },
      stroke: { width: 2, curve: 'smooth', colors: [PROGRESS_ACCENT] },
      fill: {
        type: 'gradient',
        colors: [PROGRESS_ACCENT],
        gradient: { opacityFrom: 0.25, opacityTo: 0.02 },
      },
      markers: { size: 4, colors: [PROGRESS_ACCENT], strokeColors: markerStroke, strokeWidth: 2 },
      tooltip: { x: { format: 'MMM d, y' } },
      legend: { show: false },
    };

    this.comparisonRadar = {
      series: [
        { name: `First (${this.formatShortDate(first.createdAt)})`, data: this.skillValues(first) },
        { name: `Latest (${this.formatShortDate(latest.createdAt)})`, data: this.skillValues(latest) },
      ],
      chart: {
        type: 'radar',
        height: 300,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      xaxis: {
        categories: ['Speed', 'Stamina', 'Balance', 'Technique', 'Consistency'],
        labels: { style: { colors: Array(5).fill(axisLabel), fontSize: '12px' } },
      },
      yaxis: { show: false },
      plotOptions: {
        radar: {
          polygons: {
            strokeColors: gridLine,
            connectorColors: gridLine,
            fill: { colors: ringFills },
          },
        },
      },
      stroke: { width: 2, colors: [PROGRESS_BEFORE, PROGRESS_ACCENT] },
      fill: { opacity: [0.1, 0.2], colors: [PROGRESS_BEFORE, PROGRESS_ACCENT] },
      markers: {
        size: 3,
        colors: [PROGRESS_BEFORE, PROGRESS_ACCENT],
        strokeColors: markerStroke,
        strokeWidth: 2,
      },
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: 'bottom',
        labels: { colors: axisLabel },
        markers: { size: 6 },
      },
      tooltip: { y: { formatter: (val: number) => `${val}/100` } },
    };
  }

  private skillValues(analysis: Analysis): number[] {
    const m = analysis.report.metrics;
    return [m.speed, m.stamina, m.balance, m.technique, m.consistency];
  }

  private formatShortDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  toggleExpand(id: string) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  deleteAnalysis(analysis: Analysis, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm('Remove this analysis from the history?')) return;

    this.analysisService.delete(analysis.id).subscribe({
      next: () => {
        this.analyses.update((list) => list.filter((a) => a.id !== analysis.id));
        if (this.expandedId() === analysis.id) this.expandedId.set(null);
      },
      error: () => {
        this.errorMessage.set('Could not delete that analysis.');
      },
    });
  }

  riskTone(level: string): { fill: string; tint: string } {
    return RISK_TONE[level?.toLowerCase()] || RISK_TONE_DEFAULT;
  }

  load() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.playerService.get(this.id).subscribe({
      next: (player) => {
        this.player.set(player);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.status === 404 ? 'Player not found.' : err?.error?.error || 'Could not load player.');
        this.loading.set(false);
      },
    });
  }

  startEdit() {
    const player = this.player();
    if (!player) return;
    this.editForm = {
      name: player.name,
      age: player.age,
      team: player.team,
      position: player.position,
      notes: player.notes,
      email: player.email || '',
      password: '',
    };
    this.editing = true;
  }

  cancelEdit() {
    this.editing = false;
  }

  saveEdit() {
    if (!this.editForm.name.trim()) return;

    this.saving.set(true);
    this.playerService.update(this.id, this.editForm).subscribe({
      next: (player) => {
        this.player.set(player);
        this.editing = false;
        this.saving.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.error || 'Could not save changes.');
        this.saving.set(false);
      },
    });
  }

  deletePlayer() {
    const player = this.player();
    if (!player || !confirm(`Remove ${player.name} from your roster? This can't be undone.`)) return;

    this.playerService.delete(this.id).subscribe({
      next: () => this.router.navigate(['/players']),
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
