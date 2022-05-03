import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {DoctorService} from '../../shared/service/doctor.service';

@Component({
  selector: 'app-eliminar-doctor',
  templateUrl: './eliminar-doctor.component.html',
  styleUrls: ['./eliminar-doctor.component.scss']
})
export class EliminarDoctorComponent{

  titulo = 'Eliminar Doctor';
  idDoctor: number;

  constructor(private router: Router, private doctorService: DoctorService) { }

  Eliminar(){
    try{
      this.doctorService.eliminarDoctor(this.idDoctor)
        .subscribe(data => console.log(data));
    } catch (error) {
      alert('Sucedio un error con la eliminacion del usaurio');
    }
  }

  Atras(){
    this.router.navigate(['doctor/listar']);
  }
}
