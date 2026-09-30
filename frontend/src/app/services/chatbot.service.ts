import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ChatbotResponse {
  respuesta: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:8000/chat';

  constructor(private http: HttpClient) {}

  enviarPregunta(pregunta: string): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(
      this.apiUrl,
      { pregunta }
    );
  }
}
