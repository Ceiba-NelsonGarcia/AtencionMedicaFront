import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ListarCitasComponent} from './components/listar-citas/listar-citas.component';
import {CrearCitaComponent} from './components/crear-cita/crear-cita.component';
import {ActualizarCitaComponent} from './components/actualizar-cita/actualizar-cita.component';
import {EliminarCitaComponent} from './components/eliminar-cita/eliminar-cita.component';

const routes: Routes = [
  { path: 'cita/listar', component: ListarCitasComponent},
  { path: 'cita/crear', component: CrearCitaComponent},
  { path: 'cita/actualizar', component: ActualizarCitaComponent},
  { path: 'cita/eliminar', component: EliminarCitaComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CitaRoutingModule { }
