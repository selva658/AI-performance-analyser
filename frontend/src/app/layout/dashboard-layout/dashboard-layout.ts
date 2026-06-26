import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';

import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.scss']
})
export class DashboardLayout implements AfterViewInit {

  @ViewChild('performanceChart')
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  chart!: Chart;

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