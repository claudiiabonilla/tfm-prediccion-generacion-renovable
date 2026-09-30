import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface DatasetInfo {
  nombre: string;
  archivo: string;
  columnas: string[];
  filasPreview: string[][];
}

@Component({
  selector: 'app-database',
  imports: [CommonModule],
  templateUrl: './database.component.html',
  styleUrl: './database.component.scss'
})
export class DatabaseComponent implements OnInit{
  datasets: DatasetInfo[] = [
    { nombre: 'Predicciones (test)', archivo: 'data/predicciones_test_2021_2025.csv', columnas: [], filasPreview: [] },
    { nombre: 'Métricas de modelos', archivo: 'data/powerbi_metricas_modelos.csv', columnas: [], filasPreview: [] },
    { nombre: 'Error por mes', archivo: 'data/powerbi_errores_por_mes.csv', columnas: [], filasPreview: [] },
    { nombre: 'Backtesting', archivo: 'data/powerbi_backtesting.csv', columnas: [], filasPreview: [] },
    { nombre: 'Días de baja generación', archivo: 'data/powerbi_dias_baja_generacion.csv', columnas: [], filasPreview: [] },
    { nombre: 'Capa Gold completa', archivo: 'data/gold_diario_2021_2025.csv', columnas: [], filasPreview: [] },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.datasets.forEach(ds => this.cargarPreview(ds));
  }

  private cargarPreview(dataset: DatasetInfo) {
    this.http.get(dataset.archivo, { responseType: 'text' }).subscribe(csvText => {
      const lineas = csvText.trim().split('\n');
      dataset.columnas = lineas[0].split(',');
      dataset.filasPreview = lineas.slice(1, 6).map(linea => linea.split(','));
    });
  }
}
