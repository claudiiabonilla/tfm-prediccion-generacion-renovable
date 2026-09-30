import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { CsvLoaderService } from '../../services/csv-loader.service';
import { FooterDatosComponent } from '../footer-datos/footer-datos.component';

interface DiaBajaGeneracion {
  fecha: string;
  generacion_fotovoltaica: number;
  z_score_mensual: number;
  prec: number;
  hrMedia: number;
  sol: number;
  tmax: number;
}

interface DiaGold {
  fecha: string;
  sol: number;
  generacion_fotovoltaica: number;
}

@Component({
  selector: 'app-dias-baja-generacion',
  imports: [CommonModule, FooterDatosComponent],
  templateUrl: './dias-baja-generacion.component.html',
  styleUrl: './dias-baja-generacion.component.scss'
})
export class DiasBajaGeneracionComponent implements OnInit{

  @ViewChild('scatterChart') scatterChartRef!: ElementRef<HTMLCanvasElement>;

  diasBaja: DiaBajaGeneracion[] = [];
  datosGold: DiaGold[] = [];

  kpiConteo = 0;
  kpiPorcentaje = 0;

  cargando = true;

  private scatterChartInstance?: Chart;

  colorGrey = getComputedStyle(document.documentElement).getPropertyValue('--color-grey').trim();
  colorWhite = getComputedStyle(document.documentElement).getPropertyValue('--color-white').trim();
  colorOrange = getComputedStyle(document.documentElement).getPropertyValue('--color-orange').trim();
  colorWhiteOpacity = getComputedStyle(document.documentElement).getPropertyValue('--color-white-opacity').trim();
  
  constructor(private csvLoader: CsvLoaderService) {}

  ngOnInit() {
    this.csvLoader.cargarCsv('data/powerbi_dias_baja_generacion.csv').subscribe(filas => {
      this.diasBaja = filas.map(f => ({
        fecha: f['fecha'],
        generacion_fotovoltaica: parseFloat(f['generacion_fotovoltaica']),
        z_score_mensual: parseFloat(f['z_score_mensual']),
        prec: parseFloat(f['prec']),
        hrMedia: parseFloat(f['hrMedia']),
        sol: parseFloat(f['sol']),
        tmax: parseFloat(f['tmax'])
      })).sort((a, b) => a.z_score_mensual - b.z_score_mensual);

      this.kpiConteo = this.diasBaja.length;

      this.csvLoader.cargarCsv('data/gold_diario_2021_2025.csv').subscribe(filasGold => {
        this.datosGold = filasGold.map(f => ({
          fecha: f['fecha'],
          sol: parseFloat(f['sol']),
          generacion_fotovoltaica: parseFloat(f['generacion_fotovoltaica'])
        }));

        this.kpiPorcentaje = (this.diasBaja.length / this.datosGold.length) * 100;
        this.cargando = false;
        setTimeout(() => {
          this.dibujarScatter();
        });
      });
    });
  }

  private dibujarScatter() {
  const mapaBaja = new Map(this.diasBaja.map(d => [d.fecha, d]));

  const puntosNormales = this.datosGold
    .filter(d => !mapaBaja.has(d.fecha))
    .map(d => ({ x: d.sol, y: d.generacion_fotovoltaica, fecha: d.fecha, esBaja: false }));

  const puntosBaja = this.datosGold
    .filter(d => mapaBaja.has(d.fecha))
    .map(d => {
      const detalle = mapaBaja.get(d.fecha)!;
      return {
        x: d.sol,
        y: d.generacion_fotovoltaica,
        fecha: d.fecha,
        esBaja: true,
        z_score: detalle.z_score_mensual,
        prec: detalle.prec,
        hrMedia: detalle.hrMedia,
        tmax: detalle.tmax
      };
    });

  if (this.scatterChartInstance) this.scatterChartInstance.destroy();

  this.scatterChartInstance = new Chart(this.scatterChartRef.nativeElement, {
    type: 'scatter',
    data: {
      datasets: [
        { label: 'Normal', data: puntosNormales, backgroundColor: this.colorWhiteOpacity , pointRadius: 3 },
        { label: 'Baja generación', data: puntosBaja, backgroundColor: this.colorOrange, pointRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: this.colorGrey }, title: { display: true, text: 'Horas de sol', color: this.colorGrey } },
        y: { ticks: { color: this.colorGrey }, title: { display: true, text: 'Generación (MWh)', color: this.colorGrey } }
      },
      plugins: {
        legend: { labels: { color: this.colorWhite } },
        tooltip: {
          backgroundColor: this.colorWhiteOpacity,
          titleColor: this.colorOrange,
          bodyColor: this.colorWhite,
          borderColor: this.colorWhiteOpacity,
          borderWidth: 1,
          padding: 12,
          callbacks: {
            title: (items) => {
              const punto = items[0].raw as any;
              return punto.fecha;
            },
            label: (item) => {
              const punto = item.raw as any;
              const lineas = [
                `Generación: ${punto.y.toFixed(0)} MWh`,
                `Horas de sol: ${punto.x.toFixed(1)} h`
              ];
              if (punto.esBaja) {
                lineas.push(
                  `Z-score: ${punto.z_score.toFixed(2)}`,
                  `Precipitación: ${punto.prec.toFixed(1)} mm`,
                  `Humedad: ${punto.hrMedia.toFixed(1)}%`,
                  `Temp. máxima: ${punto.tmax.toFixed(1)}°C`
                );
              }
              return lineas;
            }
          }
        }
      }
    }
  });
}
}
