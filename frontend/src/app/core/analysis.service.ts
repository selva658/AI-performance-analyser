import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AnalysisReport {
  analysis_mode: 'video' | 'stats_only';
  strengths: string[];
  weaknesses: string[];
  posture_analysis: string;
  recommendations: string[];
  injury_risk: string;
  risk_level: string;
  metrics: {
    overall_score: number;
    speed: number;
    stamina: number;
    technique: number;
    consistency: number;
    balance: number;
  };
}

export interface Analysis {
  id: string;
  playerId: string;
  createdAt: string;
  report: AnalysisReport;
}

const API_URL = `${environment.apiUrl}/analyses`;

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  constructor(private http: HttpClient) {}

  listForPlayer(playerId: string): Observable<Analysis[]> {
    return this.http.get<Analysis[]>(API_URL, { params: { playerId } });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
