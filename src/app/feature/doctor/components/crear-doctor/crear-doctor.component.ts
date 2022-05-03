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
/*  tarifas = [
              {
                idTarifa: 1,
                nombre: 'General'
              },
              {
                idTarifa: 2,
                nombre: 'Especialista'
              }
            ];*/

  constructor(private router: Router, private doctorService: DoctorService) { }

  Crear(){
    const doctorDto: DoctorDTO = {nombreDoctor: this.nombreDoctor, idTarifa: 1, idHorario: this.idHorario};
    console.log('Se crea DoctorDTO', doctorDto);
    try{
      this.doctorService.crearDoctor(doctorDto)
        .subscribe(data => console.log(data));
    } catch (error) {
      alert('Sucedió un error con la creación del usaurio');
    }
  }

  Atras(){
    this.router.navigate(['doctor/listar']);
  }

}
