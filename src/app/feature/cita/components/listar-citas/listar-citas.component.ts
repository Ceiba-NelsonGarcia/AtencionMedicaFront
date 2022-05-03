import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {Cita} from '../../shared/model/Cita';
import {CitaService} from '../../shared/service/cita.service';

@Component({
  selector: 'app-listar-citas',
  templateUrl: './listar-citas.component.html',
  styleUrls: ['./listar-citas.component.scss']
})
export class ListarCitasComponent implements OnInit {

  constructor(private citaService: CitaService, private router: Router) { }

  public listarCitas: Cita[];

  ngOnInit(): void {
    this.citaService.consultar()
      .subscribe((res: Cita[]) => this.listarCitas = res);
  }

  public async goCrear(): Promise<void> {
    await this.router.navigate(['/cita/crear']);
  }
  public async goActualizar(): Promise<void> {
    await this.router.navigate(['/cita/actualizar']);
  }
  public async goEliminar(): Promise<void> {
    await this.router.navigate(['/cita/eliminar']);
  }

  public async goBack(): Promise<void> {
    await this.router.navigate(['']);
  }
}
