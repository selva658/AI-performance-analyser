import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  NgApexchartsModule,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexPlotOptions,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexStroke,
  ApexFill
} from 'ng-apexcharts';

export type RadialChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  labels: string[];
};

export type RadarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  fill: ApexFill;
};
@Component({
  selector: 'app-video-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, NgApexchartsModule],
  templateUrl: './video-analysis.html',
  styleUrl: './video-analysis.scss',
})
export class VideoAnalysis {
  selectedFile: File | null = null;
  report: any = null;
  loading = false;

  player = {
    name: '',
    age: 14,
    speed: 80,
    stamina: 70,
    notes: ''
  };

  overallScore = 72;
  riskPercent = 64;

  metrics = [
    { name: 'Speed', value: 80 },
    { name: 'Stamina', value: 70 },
    { name: 'Technique', value: 68 },
    { name: 'Consistency', value: 75 }
  ];

  public scoreGauge!: any;
  public speedGauge!: any;
  public staminaGauge!: any;
  public riskGauge!: any;

  public radarChart!: any;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.initCharts();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  analyze() {
    this.loading = true;
    this.report = null;

    this.http
      .post('http://localhost:3000/api/ai/video-analysis', this.player)
      .subscribe({
        next: (res: any) => {
          console.log('Response:', res);

          this.report = { ...res };

          // Dynamic metrics
          this.metrics = [
            { name: 'Speed', value: this.player.speed },
            { name: 'Stamina', value: this.player.stamina },
            { name: 'Technique', value: 68 },
            { name: 'Consistency', value: 75 }
          ];

          // Dynamic score
          this.overallScore = Math.round(
            this.metrics.reduce((sum, item) => sum + item.value, 0) /
            this.metrics.length
          );

          // Dynamic risk
          this.riskPercent = this.calculateRisk();

          this.scoreGauge = this.buildGauge(this.overallScore, '#2563eb', 'Score');
          this.speedGauge = this.buildGauge(this.player.speed, '#22c55e', 'Speed');
          this.staminaGauge = this.buildGauge(this.player.stamina, '#f59e0b', 'Stamina');
          this.riskGauge = this.buildGauge(this.riskPercent, '#8b5cf6', 'Risk');

          this.radarChart = {
            ...this.radarChart,
            series: [
              {
                name: 'Skills',
                data: [
                  this.player.speed,
                  this.player.stamina,
                  74,
                  68,
                  75
                ]
              }
            ]
          };
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  calculateRisk(): number {
    let risk = 20;

    if (this.player.stamina < 50) risk += 25;
    if (this.player.speed > 75) risk += 10;

    if (this.report?.injury_risk?.toLowerCase().includes('moderate')) {
      risk += 20;
    }

    return Math.min(risk, 100);
  }

  initCharts() {
  this.scoreGauge = this.buildGauge(this.overallScore, '#2563eb', 'Score');
  this.speedGauge = this.buildGauge(this.player.speed, '#22c55e', 'Speed');
  this.staminaGauge = this.buildGauge(this.player.stamina, '#f59e0b', 'Stamina');
  this.riskGauge = this.buildGauge(this.riskPercent, '#8b5cf6', 'Risk');

  this.radarChart = {
    series: [
      {
        name: 'Skills',
        data: [80, 70, 74, 68, 75]
      }
    ],
    chart: {
      height: 320,
      type: 'radar'
    },
    xaxis: {
      categories: ['Speed', 'Stamina', 'Balance', 'Technique', 'Consistency']
    },
    stroke: {
      width: 2
    },
    fill: {
      opacity: 0.25
    }
  };
}

buildGauge(value: number, color: string, label: string) {
  return {
    series: [value],
    chart: {
      type: 'radialBar',
      height: 180
    },
    labels: [label],
    plotOptions: {
      radialBar: {
        hollow: {
          size: '60%'
        },
        dataLabels: {
          name: {
            show: true
          },
          value: {
            fontSize: '28px',
            fontWeight: 700
          }
        }
      }
    },
    colors: [color]
  };
}
}