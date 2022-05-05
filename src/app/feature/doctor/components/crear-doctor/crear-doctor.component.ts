import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {DoctorDTO} from '../../shared/model/doctor';
import {DoctorService} from '../../shared/service/doctor.service';


@Component({
  selector: 'app-crear-doctor',
  templateUrl: './crear-doctor.component.html',
  styleUrls: ['./crear-doctor.component.scss']
})
export class CrearDoctorComponent {

  titulo = 'Crear Doctor';
  nombreDoctor: string;
  idTarifa: number;
  idHorario: number;
  confirmacion = false;

  constructor(private router: Router, private doctorService: DoctorService) { }

  crear(){
    const doctorDto: DoctorDTO = {nombreDoctor: this.nombreDoctor, idTarifa: 1, idHorario: this.idHorario};
    try{
      this.doctorService.crearDoctor(doctorDto)
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
