import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListarCitasComponent } from './components/listar-citas/listar-citas.component';
import { CrearCitaComponent } from './components/crear-cita/crear-cita.component';
import { EliminarCitaComponent } from './components/eliminar-cita/eliminar-cita.component';
import { ActualizarCitaComponent } from './components/actualizar-cita/actualizar-cita.component';



@NgModule({
  declarations: [
    ListarCitasComponent,
    CrearCitaComponent,
    EliminarCitaComponent,
    ActualizarCitaComponent
  ],
  imports: [
    CommonModule
  ]
})
export class CitaModule { }
