import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FechaSeleccionadaService {
  private fechaSubject = new BehaviorSubject<string>('');

  fecha$ = this.fechaSubject.asObservable();

  cambiarFecha(fecha: string) {
    this.fechaSubject.next(fecha);
  }
}
