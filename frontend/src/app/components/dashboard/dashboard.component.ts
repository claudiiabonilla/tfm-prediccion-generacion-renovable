import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { CsvLoaderService } from '../../services/csv-loader.service';
import { FechaSeleccionadaService } from '../../services/fecha-seleccionada.service';
import { FooterDatosComponent } from '../footer-datos/footer-datos.component';

interface Prediccion {
  fecha: string;
  generacion_real: number;
  generacion_predicha: number;
  error: number;
}

interface MetricaModelo {
  modelo: string;
  MAE: number;
  RMSE: number;
}

interface Backtest {
  ventana_inicio: string;
  mejora_pct: number;
}

interface DiaGold {
  fecha: string;
  generacion_fotovoltaica: number;
  mes: number;
  tmax: number;
  tmin: number;
  tmed: number;
  prec: number;
  sol: number;
  hrMedia: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, FooterDatosComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('backtestChart') backtestChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('temperatureGauge') temperatureGaugeRef!: ElementRef<HTMLCanvasElement>;

  predicciones: Prediccion[] = [];
  prediccionesCompletas: Prediccion[] = [];

  metricas: MetricaModelo[] = [];
  backtesting: Backtest[] = [];
  datosGold: DiaGold[] = [];

  kpiPrediccion = 0;
  kpiGeneracionAyer = 0;
  kpiVariacionGeneracionAyer = 0;
  kpiVariacion = 0;
  kpiFiabilidad = 0;
  kpiVariacionMes = 0;

  fechaDesde = '';
  fechaHasta = '';
  fechaSeleccionada = '';
  fechaObjetivoFormateada = '';

  meteoPrediccion = {
    tmax: 0,
    tmin: 0,
    tmed: 0,
    prec: 0,
    sol: 0,
    hrMedia: 0
  };

  cargando = true;

  colorGrey = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-grey')
    .trim();

  colorWhite = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-white')
    .trim();

  colorOrange = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-orange')
    .trim();

  private lineChartInstance?: Chart;
  private barChartInstance?: Chart;
  private backtestChartInstance?: Chart;
  private gaugeChartInstance?: Chart;

  constructor(
    private csvLoader: CsvLoaderService,
    private fechaService: FechaSeleccionadaService
  ) {}

  ngOnInit() {


    // PREDICCIONES

    this.csvLoader
      .cargarCsv('data/predicciones_test_2021_2025.csv')
      .subscribe(filas => {

        this.prediccionesCompletas = filas.map(f => ({
          fecha: f['fecha'],
          generacion_real: parseFloat(f['generacion_real']) / 1000,
          generacion_predicha: parseFloat(f['generacion_predicha']) / 1000,
          error: parseFloat(f['error']) / 1000
        }));

        this.predicciones = this.prediccionesCompletas;

        if (this.prediccionesCompletas.length > 0) {
          this.fechaSeleccionada =
          this.prediccionesCompletas[
            this.prediccionesCompletas.length - 1
          ].fecha;

        this.fechaService.cambiarFecha(
          this.fechaSeleccionada
        );

        this.actualizarFechaObjetivo();
        }

        this.calcularKpis(this.predicciones);
        this.dibujarGraficoLineas(this.predicciones);

        // Seleccionar meteorología del día objetivo
        this.actualizarMeteorologiaPrediccion();

        this.cargando = false;
      });

    // MÉTRICAS DE MODELOS

    this.csvLoader
      .cargarCsv('data/powerbi_metricas_modelos.csv')
      .subscribe(filas => {

        this.metricas = filas.map(f => ({
          modelo: f['modelo'],
          MAE: parseFloat(f['MAE']),
          RMSE: parseFloat(f['RMSE'])
        }));

        this.dibujarGraficoBarras();
      });

    // BACKTESTING

    this.csvLoader
      .cargarCsv('data/powerbi_backtesting.csv')
      .subscribe(filas => {

        this.backtesting = filas.map(f => ({
          ventana_inicio: f['ventana_inicio'],
          mejora_pct: parseFloat(f['mejora_%'])
        }));

        const positivas = filas.filter(
          f => parseFloat(f['mejora_%']) > 0
        ).length;

        this.kpiFiabilidad = Math.round(
          (positivas / filas.length) * 100
        );

        this.dibujarGraficoBacktesting(this.backtesting);
      });

  this.csvLoader
    .cargarCsv('data/gold_diario_2021_2025.csv')
    .subscribe(filas => {

      this.datosGold = filas.map(f => ({
        fecha: f['fecha'],
        generacion_fotovoltaica: parseFloat(f['generacion_fotovoltaica']),
        mes: parseInt(f['mes'], 10),
        tmax: parseFloat(f['tmax']),
        tmin: parseFloat(f['tmin']),
        tmed: parseFloat(f['tmed']),
        prec: parseFloat(f['prec']),
        sol: parseFloat(f['sol']),
        hrMedia: parseFloat(f['hrMedia'])
      }));

      this.calcularVariacionMes(this.datosGold);
      this.actualizarMeteorologiaPrediccion();
    });
  }

  private actualizarMeteorologiaPrediccion() {
    if (
        this.fechaSeleccionada === '' ||
        this.datosGold.length === 0
      ) {
        return;
      }

      const diaObjetivo = this.datosGold.find(
        d => d.fecha === this.fechaSeleccionada
      );

      if (!diaObjetivo) {
        console.warn(
          'No se encontraron datos meteorológicos para:',
          this.fechaSeleccionada
        );
        return;
      }

      this.meteoPrediccion = {
        tmax: diaObjetivo.tmax,
        tmin: diaObjetivo.tmin,
        tmed: diaObjetivo.tmed,
        prec: diaObjetivo.prec,
        sol: diaObjetivo.sol,
        hrMedia: diaObjetivo.hrMedia
      };

      setTimeout(() => {
        this.dibujarTemperatureGauge();
      });
    }

  aplicarFiltroFecha() {
    const desde = this.fechaDesde ? new Date(this.fechaDesde) : null;
    const hasta = this.fechaHasta ? new Date(this.fechaHasta) : null;

    const dentroDelRango = (fechaStr: string) => {
      const fecha = new Date(fechaStr);
      if (desde && fecha < desde) return false;
      if (hasta && fecha > hasta) return false;
      return true;
    };

    this.predicciones = this.prediccionesCompletas.filter(p => dentroDelRango(p.fecha));

    if (this.predicciones.length > 0) {
      this.fechaSeleccionada = this.predicciones[this.predicciones.length - 1].fecha;
      this.fechaService.cambiarFecha(this.fechaSeleccionada);
    }

    this.actualizarFechaObjetivo();
    this.dibujarGraficoLineas(this.predicciones);
    this.calcularKpis(this.predicciones);

    const backtestingFiltrado = this.backtesting.filter(b => dentroDelRango(b.ventana_inicio));
    this.dibujarGraficoBacktesting(backtestingFiltrado);
    this.recalcularFiabilidad(backtestingFiltrado);

    this.actualizarMeteorologiaPrediccion();

    const goldFiltrado = this.datosGold.filter(d => dentroDelRango(d.fecha));
    if (goldFiltrado.length > 0) {
      this.calcularVariacionMes(goldFiltrado);
    }
  }

  private actualizarFechaObjetivo() {
    if (!this.fechaSeleccionada) {
      this.fechaObjetivoFormateada = '';
      return;
    }

    const fecha = new Date(
      this.fechaSeleccionada + 'T00:00:00'
    );

    this.fechaObjetivoFormateada =
      new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(fecha);
  }

  limpiarFiltro() {

    this.fechaDesde = '';
    this.fechaHasta = '';

    this.aplicarFiltroFecha();
  }

  private calcularKpis(datos: Prediccion[]) {

    if (datos.length < 2) return;

    const ultima =
      datos[datos.length - 1];

    const anterior =
      datos[datos.length - 2];

    const anteAnterior =
      datos[datos.length - 3];

    this.kpiPrediccion =
      ultima.generacion_predicha;

    this.kpiGeneracionAyer =
      ultima.generacion_real;

    this.kpiVariacion =
      anterior
        ? (
            (
              ultima.generacion_predicha -
              anterior.generacion_real
            ) /
            anterior.generacion_real
          ) * 100
        : 0;

    this.kpiVariacionGeneracionAyer =
      anteAnterior
        ? (
            (
              anterior.generacion_real -
              anteAnterior.generacion_real
            ) /
            anteAnterior.generacion_real
          ) * 100
        : 0;
  }

  private recalcularFiabilidad(datos: Backtest[]) {

    if (datos.length === 0) {
      this.kpiFiabilidad = 0;
      return;
    }

    const positivas =
      datos.filter(
        b => b.mejora_pct > 0
      ).length;

    this.kpiFiabilidad =
      Math.round(
        (positivas / datos.length) * 100
      );
  }

  private calcularVariacionMes(datos: DiaGold[]) {

    if (datos.length === 0) return;

    const ultimoDia =
      datos[datos.length - 1];

    const mesActual =
      ultimoDia.mes;

    const diasDelMes =
      datos.filter(
        d => d.mes === mesActual
      );

    const mediaDelMes =
      diasDelMes.reduce(
        (acc, d) =>
          acc + d.generacion_fotovoltaica,
        0
      ) / diasDelMes.length;

    this.kpiVariacionMes =
      (
        (
          ultimoDia.generacion_fotovoltaica -
          mediaDelMes
        ) /
        mediaDelMes
      ) * 100;
  }

  private dibujarGraficoLineas(datos: Prediccion[]) {

    if (this.lineChartInstance) {
      this.lineChartInstance.destroy();
    }

    this.lineChartInstance =
      new Chart(this.lineChartRef.nativeElement, {

        type: 'line',

        data: {

          labels: datos.map(
            p => p.fecha
          ),

          datasets: [

            {
              label: 'Generación real',

              data: datos.map(
                p => p.generacion_real
              ),

              borderColor: this.colorOrange,
              borderWidth: 2,
              pointRadius: 0
            },

            {
              label: 'Generación predicha',

              data: datos.map(
                p => p.generacion_predicha
              ),

              borderColor: this.colorWhite,
              borderDash: [5, 5],
              borderWidth: 2,
              pointRadius: 0
            }
          ]
        },

        options: {

          responsive: true,
          maintainAspectRatio: false,

          scales: {

            x: {
              ticks: {
                color: this.colorGrey,
                maxTicksLimit: 12
              }
            },

            y: {
              ticks: {
                color: this.colorGrey
              },

              title: {
                display: true,
                text: 'GWh',
                color: this.colorGrey
              }
            }
          },

          plugins: {

            legend: {
              labels: {
                color: '#fff'
              }
            }
          }
        }
      });
  }


  // GRÁFICO DE BARRAS

  private dibujarGraficoBarras() {

    const ordenado =
      [...this.metricas].sort(
        (a, b) => a.MAE - b.MAE
      );

    if (this.barChartInstance) {
      this.barChartInstance.destroy();
    }

    this.barChartInstance =
      new Chart(this.barChartRef.nativeElement, {

        type: 'bar',

        data: {

          labels: ordenado.map(
            m => m.modelo
          ),

          datasets: [{

            label: 'MAE',

            data: ordenado.map(
              m => m.MAE
            ),

            backgroundColor:
              this.colorOrange
          }]
        },

        options: {

          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,

          scales: {

            x: {
              ticks: {
                color: this.colorGrey
              }
            },

            y: {
              ticks: {
                color: this.colorGrey
              }
            }
          },

          plugins: {

            legend: {
              display: false
            }
          }
        }
      });
  }


  // GRÁFICO BACKTESTING

  private dibujarGraficoBacktesting(
    datos: Backtest[]
  ) {

    if (this.backtestChartInstance) {
      this.backtestChartInstance.destroy();
    }

    this.backtestChartInstance =
      new Chart(this.backtestChartRef.nativeElement, {

        type: 'line',

        data: {

          labels: datos.map(
            b => b.ventana_inicio
          ),

          datasets: [

            {
              label: 'Mejora vs. baseline (%)',

              data: datos.map(
                b => b.mejora_pct
              ),

              borderColor:
                this.colorOrange,

              borderWidth: 2,
              pointRadius: 3
            },

            {
              label: 'Empate',

              data: datos.map(
                () => 0
              ),

              borderColor:
                this.colorGrey,

              borderDash: [5, 5],
              borderWidth: 1,
              pointRadius: 0
            }
          ]
        },

        options: {

          responsive: true,
          maintainAspectRatio: false,

          scales: {

            x: {
              ticks: {
                color: this.colorGrey
              }
            },

            y: {
              ticks: {
                color: this.colorGrey
              }
            }
          },

          plugins: {

            legend: {
              labels: {
                color: this.colorWhite
              }
            }
          }
        }
      });
  }


  // GAUGE DE TEMPERATURA

  private dibujarTemperatureGauge() {

    const temperatura =
      this.meteoPrediccion.tmed;

    const minTemp = -10;
    const maxTemp = 45;

    const valor =
      Math.min(
        Math.max(
          temperatura,
          minTemp
        ),
        maxTemp
      );

    const porcentaje =
      (valor - minTemp) /
      (maxTemp - minTemp);

    if (this.gaugeChartInstance) {
      this.gaugeChartInstance.destroy();
    }

    this.gaugeChartInstance =
      new Chart(
        this.temperatureGaugeRef.nativeElement,
        {

          type: 'doughnut',

          data: {

            datasets: [{

              data: [
                porcentaje * 100,
                100 - (porcentaje * 100)
              ],

              backgroundColor: [
                this.colorOrange,
                this.colorWhite
              ],

              borderWidth: 0
            }]
          },

          options: {

            responsive: true,
            maintainAspectRatio: false,

            rotation: -90,
            circumference: 180,
            cutout: '75%',

            plugins: {

              legend: {
                display: false
              },

              tooltip: {
                enabled: false
              }
            }
          }
        }
      );
  }
}
