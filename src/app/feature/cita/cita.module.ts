import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListarCitasComponent } from './components/listar-citas/listar-citas.component';
import { CrearCitaComponent } from './components/crear-cita/crear-cita.component';
import { EliminarCitaComponent } from './components/eliminar-cita/eliminar-cita.component';
import { ActualizarCitaComponent } from './components/actualizar-cita/actualizar-cita.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {CitaRoutingModule} from './cita-routing.module';
import {CitaService} from './shared/service/cita.service';

@NgModule({
  declarations: [
    ListarCitasComponent,
    CrearCitaComponent,
    EliminarCitaComponent,
    ActualizarCitaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CitaRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [CitaService]
})
export class CitaModule { }
