import { Component, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-video-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

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
        console.log("Response:", res);

        this.report = { ...res }; // force new reference
        this.loading = false;
        this.cdr.detectChanges()
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
}
}
