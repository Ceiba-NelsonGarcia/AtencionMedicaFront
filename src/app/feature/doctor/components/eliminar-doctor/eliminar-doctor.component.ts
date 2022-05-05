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
  confirmacion = false;

  constructor(private router: Router, private doctorService: DoctorService) { }

  eliminar(){
    try{
      this.doctorService.eliminarDoctor(this.idDoctor)
        .subscribe(data => console.log(data));
      this.confirmacion = true;
    } catch (error) {
      alert('Sucedio un error con la eliminacion del usaurio');
    }
  }

  atras(){
    this.router.navigate(['doctor/listar']);
  }
}
