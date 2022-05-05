import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {CitaService} from '../../shared/service/cita.service';

@Component({
  selector: 'app-eliminar-cita',
  templateUrl: './eliminar-cita.component.html',
  styleUrls: ['./eliminar-cita.component.scss']
})
export class EliminarCitaComponent{

  titulo = 'Eliminar Cita';
  idCita: number;
  confirmacion = false;
  constructor(private router: Router, private citaService: CitaService) { }

  eliminar(){
    try{
      this.citaService.eliminarCita(this.idCita)
        .subscribe(data => console.log(data));
      this.confirmacion = true;
    } catch (error) {
      alert('Sucedio un error con la eliminacion de la cita');
    }
  }

  atras(){
    this.router.navigate(['cita/listar']);
  }

}
