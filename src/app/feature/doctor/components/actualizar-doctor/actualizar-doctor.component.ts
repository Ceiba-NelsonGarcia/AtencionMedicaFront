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

  constructor(private router: Router, private doctorService: DoctorService) { }

  Actualizar(){
    const doctor: Doctor = {idDoctor: this.idDoctor, nombreDoctor: this.nombreDoctor, idTarifa: this.idTarifa, idHorario: this.idHorario};
    try{
      this.doctorService.actualizarDoctor(this.idDoctor, doctor)
        .subscribe(data => console.log(data));
    } catch (error) {
      alert('Sucedió un error con la creación del usaurio');
    }
  }

  Atras(){
    this.router.navigate(['doctor/listar']);
  }
}
