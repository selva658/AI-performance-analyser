import { Component, ChangeDetectorRef, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  LucideAngularModule,
  Sparkles,
  User,
  CloudUpload,
  Video,
  TriangleAlert,
  CircleCheck,
  Lightbulb,
  HeartPulse,
  PersonStanding,
} from 'lucide-angular';
import { ThemeService } from '../../core/theme.service';
import { Player, PlayerService } from '../../core/player.service';

type Tone = { fill: string; tint: string };

const PALETTE = {
  accent: '#4f46e5',
  speed: '#10b981',
  stamina: '#f59e0b',
};

const TINTS = {
  accent: '#eef2ff',
  speed: '#ecfdf5',
  stamina: '#fffbeb',
};

const RISK_TONES: Record<'low' | 'medium' | 'high', Tone & { label: string }> = {
  low: { fill: '#10b981', tint: '#ecfdf5', label: 'Low risk' },
  medium: { fill: '#f59e0b', tint: '#fffbeb', label: 'Medium risk' },
  high: { fill: '#ef4444', tint: '#fef2f2', label: 'High risk' },
};

interface StatTile {
  key: string;
  label: string;
  value: number;
  tone: string;
  tint: string;
  hero: boolean;
  sublabel: string;
}

type ReportTab = 'posture' | 'recommendations' | 'injury';

@Component({
  selector: 'app-video-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgApexchartsModule, LucideAngularModule],
  templateUrl: './video-analysis.html',
  styleUrl: './video-analysis.scss',
})
export class VideoAnalysis implements OnInit {
  readonly icons = { Sparkles, User, CloudUpload, Video, TriangleAlert, CircleCheck, Lightbulb, HeartPulse, PersonStanding };

  selectedFile: File | null = null;
  report: any = null;
  loading = false;
  errorMessage: string | null = null;
  activeTab: ReportTab = 'posture';
  linkedPlayer: Player | null = null;

  player = {
    name: '',
    age: null as number | null,
    speed: null as number | null,
    stamina: null as number | null,
    notes: '',
  };

  statTiles: StatTile[] = [];
  skillBreakdown: { label: string; value: number }[] = [];

  public radarChart: any = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private playerService: PlayerService,
    public theme: ThemeService,
  ) {
    effect(() => {
      this.theme.theme();
      if (this.skillBreakdown.length) {
        this.initRadar(this.skillBreakdown.map((s) => s.value));
        this.cdr.detectChanges();
      }
    });
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const playerId = params.get('playerId');
      if (!playerId) {
        this.linkedPlayer = null;
        return;
      }
      this.playerService.get(playerId).subscribe({
        next: (player) => {
          this.linkedPlayer = player;
          this.player.name = player.name;
          this.player.age = player.age;
          if (player.notes) this.player.notes = player.notes;
          this.cdr.detectChanges();
        },
        error: () => {
          this.linkedPlayer = null;
          this.cdr.detectChanges();
        },
      });
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  setTab(tab: ReportTab) {
    this.activeTab = tab;
  }

  get reportStatus(): { label: string; tone: 'neutral' | 'progress' | 'good' | 'critical' } {
    if (this.loading) return { label: 'Analyzing…', tone: 'progress' };
    if (this.errorMessage) return { label: 'Analysis failed', tone: 'critical' };
    if (this.report) return { label: 'Completed', tone: 'good' };
    return { label: 'Ready to analyze', tone: 'neutral' };
  }

  analyze() {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a video before analyzing.';
      return;
    }

    this.loading = true;
    this.report = null;
    this.errorMessage = null;
    this.activeTab = 'posture';

    const formData = new FormData();
    formData.append('video', this.selectedFile, this.selectedFile.name);
    formData.append('player', JSON.stringify(this.player));
    if (this.linkedPlayer) {
      formData.append('playerId', this.linkedPlayer.id);
    }

    this.http.post('http://localhost:3000/api/ai/video-analysis', formData).subscribe({
      next: (res: any) => {
        this.report = res;

        const metrics = res.metrics;
        const risk = this.riskTone(res.risk_level);
        const riskPercent = this.mapRisk(res.risk_level);

        this.buildStatTiles(metrics.overall_score, metrics.speed, metrics.stamina, risk, riskPercent);

        this.skillBreakdown = [
          { label: 'Speed', value: metrics.speed },
          { label: 'Stamina', value: metrics.stamina },
          { label: 'Balance', value: metrics.balance },
          { label: 'Technique', value: metrics.technique },
          { label: 'Consistency', value: metrics.consistency },
        ];

        this.initRadar([metrics.speed, metrics.stamina, metrics.balance, metrics.technique, metrics.consistency]);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err?.error?.error || 'Video analysis failed. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  buildStatTiles(score: number, speed: number, stamina: number, risk: Tone & { label: string }, riskPercent: number) {
    this.statTiles = [
      {
        key: 'score',
        label: 'Overall Score',
        value: score,
        tone: PALETTE.accent,
        tint: TINTS.accent,
        hero: true,
        sublabel: this.scoreBucket(score),
      },
      {
        key: 'speed',
        label: 'Speed',
        value: speed,
        tone: PALETTE.speed,
        tint: TINTS.speed,
        hero: false,
        sublabel: 'out of 100',
      },
      {
        key: 'stamina',
        label: 'Stamina',
        value: stamina,
        tone: PALETTE.stamina,
        tint: TINTS.stamina,
        hero: false,
        sublabel: 'out of 100',
      },
      {
        key: 'risk',
        label: 'Injury Risk',
        value: riskPercent,
        tone: risk.fill,
        tint: risk.tint,
        hero: false,
        sublabel: risk.label,
      },
    ];
  }

  scoreBucket(score: number): string {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs work';
  }

  initRadar(data: number[]) {
    const dark = this.theme.theme() === 'dark';
    const axisLabel = dark ? '#c3c2c9' : '#585866';
    const gridLine = dark ? '#2b2b33' : '#e5e5ea';
    const ringFills = dark ? ['#1c1c22', '#17171c'] : ['#fafafa', '#ffffff'];
    const markerStroke = dark ? '#17171c' : '#ffffff';
    const labelInk = dark ? '#f4f4f5' : '#0b0b0f';
    const labelBg = dark ? '#26262e' : '#ffffff';

    this.radarChart = {
      series: [{ name: 'Skills', data }],
      chart: {
        height: 380,
        type: 'radar',
        width: '100%',
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      xaxis: {
        categories: ['Speed', 'Stamina', 'Balance', 'Technique', 'Consistency'],
        labels: {
          style: { colors: Array(5).fill(axisLabel), fontSize: '13px' },
        },
      },
      yaxis: {
        show: false,
      },
      plotOptions: {
        radar: {
          polygons: {
            strokeColors: gridLine,
            connectorColors: gridLine,
            fill: { colors: ringFills },
          },
        },
      },
      stroke: {
        width: 2,
        colors: [PALETTE.accent],
      },
      fill: {
        opacity: 0.2,
        colors: [PALETTE.accent],
      },
      markers: {
        size: 4,
        colors: [PALETTE.accent],
        strokeColors: markerStroke,
        strokeWidth: 2,
      },
      dataLabels: {
        enabled: true,
        background: { enabled: true, borderRadius: 4, foreColor: labelBg },
        style: { fontSize: '11px', colors: [labelInk] },
      },
      legend: {
        show: false,
      },
      tooltip: {
        y: { formatter: (val: number) => `${val}/100` },
      },
    };
  }

  riskTone(level: string): Tone & { label: string } {
    switch (level?.toLowerCase()) {
      case 'low':
        return RISK_TONES.low;
      case 'high':
        return RISK_TONES.high;
      case 'medium':
        return RISK_TONES.medium;
      default:
        return { ...RISK_TONES.medium, label: 'Risk unknown' };
    }
  }

  mapRisk(level: string) {
    switch (level?.toLowerCase()) {
      case 'low':
        return 25;
      case 'medium':
        return 55;
      case 'high':
        return 85;
      default:
        return 50;
    }
  }
}
