import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {Doctor} from '../../shared/model/doctor';
import {DoctorService} from '../../shared/service/doctor.service';

@Component({
  selector: 'app-listar-doctores',
  templateUrl: './listar-doctores.component.html',
  styleUrls: ['./listar-doctores.component.scss']
})
export class ListarDoctoresComponent implements OnInit {

  constructor(private doctorService: DoctorService, private router: Router) { }

  public listarDoctores: Doctor[];

  ngOnInit(): void {
     this.doctorService.consultar()
      .subscribe((res: Doctor[]) => this.listarDoctores = res);
  }

  public async goCrear(): Promise<void> {
    await this.router.navigate(['/doctor/crear']);
  }
  public async goActualizar(): Promise<void> {
    await this.router.navigate(['/doctor/actualizar']);
  }
  public async goEliminar(): Promise<void> {
    await this.router.navigate(['/doctor/eliminar']);
  }

  public async goBack(): Promise<void> {
    await this.router.navigate(['']);
  }
}
