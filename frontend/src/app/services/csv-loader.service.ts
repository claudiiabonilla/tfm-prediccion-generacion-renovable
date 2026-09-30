import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CsvLoaderService {
  constructor(private http: HttpClient) {}

    cargarCsv(ruta: string): Observable<Record<string, string>[]> {
      return this.http.get(ruta, { responseType: 'text' }).pipe(
        map(csvText => {
          const lineas = csvText.trim().split(/\r?\n/);
          const cabeceras = lineas[0].split(',');
          return lineas.slice(1).map(linea => {
            const valores = linea.split(',');
            const fila: Record<string, string> = {};
            cabeceras.forEach((cabecera, i) => fila[cabecera] = valores[i]);
            return fila;
          });
        })
      );
  }
}
