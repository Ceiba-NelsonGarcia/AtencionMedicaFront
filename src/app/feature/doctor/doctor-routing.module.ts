import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ListarDoctoresComponent} from './components/listar-doctores/listar-doctores.component';
import {CrearDoctorComponent} from './components/crear-doctor/crear-doctor.component';
import {ActualizarDoctorComponent} from './components/actualizar-doctor/actualizar-doctor.component';
import {EliminarDoctorComponent} from './components/eliminar-doctor/eliminar-doctor.component';

const routes: Routes = [
  { path: 'doctor/listar', component: ListarDoctoresComponent},
  { path: 'doctor/crear', component: CrearDoctorComponent},
  { path: 'doctor/actualizar', component: ActualizarDoctorComponent},
  { path: 'doctor/eliminar', component: EliminarDoctorComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorRoutingModule { }
