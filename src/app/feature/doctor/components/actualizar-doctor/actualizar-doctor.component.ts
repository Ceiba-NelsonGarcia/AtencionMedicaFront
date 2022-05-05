import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {DoctorService} from '../../shared/service/doctor.service';
import {Doctor} from '../../shared/model/doctor';


@Component({
  selector: 'app-actualizar-doctor',
  templateUrl: './actualizar-doctor.component.html',
  styleUrls: ['./actualizar-doctor.component.scss']
})
export class ActualizarDoctorComponent{

  titulo = 'Actualizar Doctor';
  idDoctor: number;
  nombreDoctor: string;
  idTarifa: number;
  idHorario: number;
  confirmacion = false;

  constructor(private router: Router, private doctorService: DoctorService) { }

  actualizar(){
    const doctor: Doctor = {idDoctor: this.idDoctor, nombreDoctor: this.nombreDoctor, idTarifa: this.idTarifa, idHorario: this.idHorario};
    try{
      this.doctorService.actualizarDoctor(this.idDoctor, doctor)
        .subscribe(data => console.log(data));
      this.confirmacion = true;
    } catch (error) {
      alert('Sucedió un error con la creación del usaurio');
    }
  }

  atras(){
    this.router.navigate(['doctor/listar']);
  }
}
