import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {CitaService} from '../../shared/service/cita.service';
import {CitaDTO} from '../../shared/model/Cita';

@Component({
  selector: 'app-crear-cita',
  templateUrl: './crear-cita.component.html',
  styleUrls: ['./crear-cita.component.scss']
})
export class CrearCitaComponent {

  titulo = 'Crear Cita';
  idUsuario: number;
  idDoctor: number;
  fechaCita: string;
  horaInicial: number;
  horaFinal: number;
  valorUsd: number;
  valorCop: number;
  confirmacion = false;

  constructor(private router: Router, private citaService: CitaService) { }

  crear(){
    const citaDto: CitaDTO = {
                                idUsuario: this.idUsuario,
                                idDoctor: this.idDoctor,
                                fechaCita: this.fechaCita,
                                horaInicial: this.horaInicial,
                                horaFinal: this.horaFinal,
                                valorUsd: this.valorUsd,
                                valorCop: this.valorCop
                              };
    try{
      this.citaService.crearCita(citaDto)
        .subscribe(data => console.log(data));
      this.confirmacion = true;
    } catch (error) {
      alert('Sucedió un error con la creación de la cita');
    }
  }

  atras(){
    this.router.navigate(['cita/listar']);
  }
}
