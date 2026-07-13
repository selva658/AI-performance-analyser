import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  signal
} from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';
import { PlayerService } from '../../core/player.service';
import { RecommendationService } from '../../core/recommendation.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.scss']
})
export class DashboardLayout implements OnInit, AfterViewInit {

  @ViewChild('performanceChart')
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  chart!: Chart;
  totalPlayers = signal(0);
  pendingInsights = signal(0);

  constructor(
    private playerService: PlayerService,
    private recommendationService: RecommendationService,
  ) {}

  ngOnInit(): void {
    this.playerService.list().subscribe({
      next: (players) => this.totalPlayers.set(players.length),
      error: () => this.totalPlayers.set(0),
    });

    this.recommendationService.listAll().subscribe({
      next: (recommendations) => {
        this.pendingInsights.set(recommendations.filter((r) => r.status === 'pending').length);
      },
      error: () => this.pendingInsights.set(0),
    });
  }

  ngAfterViewInit(): void {

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun'],
        datasets: [
          {
            label: 'Attack',
            data: [25,40,35,50,65,70],
            borderColor: '#4F46E5',
            backgroundColor: 'transparent',
            tension: 0.4
          },
          {
            label: 'Defense',
            data: [20,28,45,40,55,60],
            borderColor: '#22C55E',
            backgroundColor: 'transparent',
            tension: 0.4
          },
          {
            label: 'Fitness',
            data: [10,18,25,20,30,42],
            borderColor: '#A855F7',
            backgroundColor: 'transparent',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);

  }

}