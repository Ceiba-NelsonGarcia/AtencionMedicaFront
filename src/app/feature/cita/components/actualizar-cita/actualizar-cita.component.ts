import { Component } from '@angular/core';
import {Cita } from '../../shared/model/Cita';
import {Router} from '@angular/router';
import {CitaService} from '../../shared/service/cita.service';

@Component({
  selector: 'app-actualizar-cita',
  templateUrl: './actualizar-cita.component.html',
  styleUrls: ['./actualizar-cita.component.scss']
})
export class ActualizarCitaComponent{

  titulo = 'Actualizar Cita';

  idCita: number;
  idUsuario: number;
  idDoctor: number;
  fechaCita: string;
  horaInicial: number;
  horaFinal: number;
  valorUsd: number;
  valorCop: number;

  constructor(private router: Router, private citaService: CitaService) { }

  Actualizar(){
    const cita: Cita = {
      idCita: this.idCita,
      idUsuario: this.idUsuario,
      idDoctor: this.idDoctor,
      fechaCita: this.fechaCita,
      horaInicial: this.horaInicial,
      horaFinal: this.horaFinal,
      valorUsd: this.valorUsd,
      valorCop: this.valorCop
    };
    try{
      this.citaService.actualizarCita(this.idCita, cita)
        .subscribe(data => console.log(data));
    } catch (error) {
      alert('Sucedió un error con la actualización de la Cita');
    }
  }

  Atras(){
    this.router.navigate(['cita/listar']);
  }

}
