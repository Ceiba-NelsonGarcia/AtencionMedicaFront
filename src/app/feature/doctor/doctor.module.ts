import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListarDoctoresComponent } from './components/listar-doctores/listar-doctores.component';
import { CrearDoctorComponent } from './components/crear-doctor/crear-doctor.component';
import { EliminarDoctorComponent } from './components/eliminar-doctor/eliminar-doctor.component';
import { ActualizarDoctorComponent } from './components/actualizar-doctor/actualizar-doctor.component';



@NgModule({
  declarations: [
    ListarDoctoresComponent,
    CrearDoctorComponent,
    EliminarDoctorComponent,
    ActualizarDoctorComponent
  ],
  imports: [
    CommonModule
  ]
})
export class DoctorModule { }
