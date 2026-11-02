import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type SessionStatus = 'upcoming' | 'completed';

export interface Session {
  id: string;
  playerId: string;
  title: string;
  scheduledAt: string;
  notes: string;
  recommendationId: string | null;
  status: SessionStatus;
  createdAt: string;
}

export interface SessionInput {
  playerId: string;
  title: string;
  scheduledAt: string;
  notes?: string;
  recommendationId?: string | null;
}

const API_URL = `${environment.apiUrl}/sessions`;

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(private http: HttpClient) {}

  create(session: SessionInput): Observable<Session> {
    return this.http.post<Session>(API_URL, session);
  }

  listForPlayer(playerId: string): Observable<Session[]> {
    return this.http.get<Session[]>(API_URL, { params: { playerId } });
  }

  listAll(): Observable<Session[]> {
    return this.http.get<Session[]>(API_URL);
  }

  updateStatus(id: string, status: SessionStatus): Observable<Session> {
    return this.http.patch<Session>(`${API_URL}/${id}`, { status });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
