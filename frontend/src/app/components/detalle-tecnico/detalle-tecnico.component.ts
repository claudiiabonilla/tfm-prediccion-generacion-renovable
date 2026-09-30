import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { CsvLoaderService } from '../../services/csv-loader.service';
import { FooterDatosComponent } from '../footer-datos/footer-datos.component';

interface Backtest {
  ventana_inicio: string;
  mejora_pct: number;
}

interface ErrorMes {
  mes: number;
  MAE_mes: number;
  dias: number;
}

@Component({
  selector: 'app-detalle-tecnico',
  imports: [CommonModule, FormsModule, FooterDatosComponent],
  templateUrl: './detalle-tecnico.component.html',
  styleUrl: './detalle-tecnico.component.scss'
})
export class DetalleTecnicoComponent implements OnInit {
  @ViewChild('backtestChart') backtestChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('errorMesChart') errorMesChartRef!: ElementRef<HTMLCanvasElement>;

  backtestingCompleto: Backtest[] = [];
  errorPorMes: ErrorMes[] = [];

  private nombresMes = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  kpiVentanasPositivas = 0;

  colorGrey = getComputedStyle(document.documentElement).getPropertyValue('--color-grey').trim();
  colorWhite = getComputedStyle(document.documentElement).getPropertyValue('--color-white').trim();
  colorOrange = getComputedStyle(document.documentElement).getPropertyValue('--color-orange').trim();

  constructor(private csvLoader: CsvLoaderService) {}

  ngOnInit() {
    this.csvLoader.cargarCsv('data/powerbi_backtesting.csv').subscribe(filas => {
      this.backtestingCompleto = filas.map(f => ({
        ventana_inicio: f['ventana_inicio'],
        mejora_pct: parseFloat(f['mejora_%'])
      }));

      this.calcularKpi();
      this.dibujarGraficoBacktesting();
    });

    this.csvLoader.cargarCsv('data/powerbi_errores_por_mes.csv').subscribe(filas => {
      this.errorPorMes = filas.map(f => ({
        mes: parseInt(f['mes'], 10),
        MAE_mes: parseFloat(f['MAE_mes']),
        dias: parseInt(f['dias'], 10)
      })).sort((a, b) => a.mes - b.mes);
      this.dibujarGraficoErrorMes();
    });
  }

  private calcularKpi() {
    const positivas = this.backtestingCompleto.filter(b => b.mejora_pct > 0).length;
    this.kpiVentanasPositivas = positivas;
  }

  private dibujarGraficoBacktesting() {
    new Chart(this.backtestChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.backtestingCompleto.map(d => d.ventana_inicio),
        datasets: [{
          label: 'Mejora vs. baseline (%)',
          data: this.backtestingCompleto.map(d => d.mejora_pct),
          borderColor: this.colorOrange,
          borderWidth: 2,
          pointRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: this.colorGrey } },
          y: {
            ticks: { color: this.colorGrey },
            title: { display: true, text: 'Mejora (%)', color: this.colorGrey }
          }
        },
        plugins: {
          legend: { labels: { color: this.colorWhite } },
        }
      }
    });
  }

  private dibujarGraficoErrorMes() {
    new Chart(this.errorMesChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.errorPorMes.map(e => this.nombresMes[e.mes]),
        datasets: [{
          label: 'MAE (MWh)',
          data: this.errorPorMes.map(e => e.MAE_mes),
          backgroundColor: this.colorOrange
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: this.colorGrey } },
          y: { ticks: { color: this.colorGrey } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}
