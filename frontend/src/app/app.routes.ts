import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DatabaseComponent } from './components/database/database.component';
import { DetalleTecnicoComponent } from './components/detalle-tecnico/detalle-tecnico.component';
import { DiasBajaGeneracionComponent } from './components/dias-baja-generacion/dias-baja-generacion.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { LayoutComponent } from './components/layout/layout.component';


export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'datos', component: DatabaseComponent },
      { path: 'documentos', component: DocumentsComponent },
      { path: 'detalle-tecnico', component: DetalleTecnicoComponent }, 
      { path: 'dias-baja-generacion', component: DiasBajaGeneracionComponent },
    ]
  }
];
