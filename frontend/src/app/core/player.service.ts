import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Player {
  id: string;
  name: string;
  age: number | null;
  team: string;
  position: string;
  notes: string;
  email: string;
  createdAt: string;
}

export type PlayerInput = Partial<Omit<Player, 'id' | 'createdAt'>> & { password?: string };

const API_URL = 'http://localhost:3000/api/players';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  constructor(private http: HttpClient) {}

  list(): Observable<Player[]> {
    return this.http.get<Player[]>(API_URL);
  }

  get(id: string): Observable<Player> {
    return this.http.get<Player>(`${API_URL}/${id}`);
  }

  create(player: PlayerInput): Observable<Player> {
    return this.http.post<Player>(API_URL, player);
  }

  update(id: string, player: PlayerInput): Observable<Player> {
    return this.http.put<Player>(`${API_URL}/${id}`, player);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
