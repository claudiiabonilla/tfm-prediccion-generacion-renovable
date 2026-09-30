import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CsvLoaderService } from '../../services/csv-loader.service';

@Component({
  selector: 'app-footer-datos',
  imports: [CommonModule],
  templateUrl: './footer-datos.component.html',
  styleUrl: './footer-datos.component.scss'
})
export class FooterDatosComponent implements OnInit {
  ultimaFecha = '';

  constructor(private csvLoader: CsvLoaderService) {}

  ngOnInit() {
    this.csvLoader.cargarCsv('data/predicciones_test_2021_2025.csv').subscribe(filas => {
      if (filas.length > 0) {
        this.ultimaFecha = filas[filas.length - 1]['fecha'];
      }
    });
  }
}
