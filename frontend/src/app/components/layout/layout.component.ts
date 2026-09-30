import { Component, OnInit } from '@angular/core';
import { RouterLinkActive, RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { ChatbotVisibilidadService } from '../../services/chatbot-visibilidad.service';
import { CsvLoaderService } from '../../services/csv-loader.service';
import { FechaSeleccionadaService } from '../../services/fecha-seleccionada.service';
import { ChatbotComponent } from '../chatbot/chatbot.component';

interface DiaGold { 
  fecha: string;
  prec: number;
  sol: number; 
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLinkWithHref, RouterLinkActive, ChatbotComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit{
  fondos: string[] = [
    'assets/img/soleado.png',
    'assets/img/lluvioso.png',
    'assets/img/nublado.jpg'
  ];

  fondoSeleccionado = '';

  private datosGold: DiaGold[] = []; 

  constructor(
    private csvLoader: CsvLoaderService,
    private fechaService: FechaSeleccionadaService,
    public chatbotVisibilidad: ChatbotVisibilidadService
  ) {}

  ngOnInit() {

    this.csvLoader
      .cargarCsv('data/gold_diario_2021_2025.csv')
      .subscribe(filas => {

        this.datosGold = filas.map(f => ({
          fecha: f['fecha'],
          prec: parseFloat(f['prec']) || 0,
          sol: parseFloat(f['sol']) || 0
        }));

        // Escuchar cambios del selector de fecha
        this.fechaService.fecha$.subscribe(fecha => {

          if (fecha) {
            this.seleccionarFondoClima(fecha);
          }

        });

      });
  }

  private seleccionarFondoClima(fecha: string) {

    const dia = this.datosGold.find(
      d => d.fecha === fecha
    );

    if (!dia) {
      console.warn(
        'No se encontraron datos meteorológicos para:',
        fecha
      );
      return;
    }

    const precipitacion = dia.prec;
    const insolacion = dia.sol;

    if (precipitacion > 1) {

      this.fondoSeleccionado = 'assets/img/lluvioso.png';

    } else if (insolacion >= 6) {

      this.fondoSeleccionado = 'assets/img/soleado.png';

    } else {

      this.fondoSeleccionado = 'assets/img/nublado.jpg';

    }
  }
}