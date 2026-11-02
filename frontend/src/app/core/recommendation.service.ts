import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type RecommendationStatus = 'pending' | 'done';

export interface Recommendation {
  id: string;
  playerId: string;
  analysisId: string;
  text: string;
  status: RecommendationStatus;
  createdAt: string;
}

const API_URL = `${environment.apiUrl}/recommendations`;

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  constructor(private http: HttpClient) {}

  listForPlayer(playerId: string): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(API_URL, { params: { playerId } });
  }

  listAll(): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(API_URL);
  }

  updateStatus(id: string, status: RecommendationStatus): Observable<Recommendation> {
    return this.http.patch<Recommendation>(`${API_URL}/${id}`, { status });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
