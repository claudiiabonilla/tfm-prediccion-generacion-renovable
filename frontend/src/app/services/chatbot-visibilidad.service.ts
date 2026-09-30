import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatbotVisibilidadService {
  abierto = signal(false);

  toggle() {
    this.abierto.update(v => !v);
  }

  cerrar() {
    this.abierto.set(false);
  }
}
