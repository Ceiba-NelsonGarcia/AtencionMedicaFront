import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../Shared/model/usuario';
import { UsuarioService } from '../../Shared/service/usuario.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-listar-usuarios',
  templateUrl: './listar-usuarios.component.html',
  styleUrls: ['./listar-usuarios.component.scss']
})
export class ListarUsuariosComponent implements OnInit {

  constructor(private usuarioService: UsuarioService, private router: Router) { }

  public listarUsuarios: Usuario[];

  ngOnInit(): void {
    this.usuarioService.consultar().subscribe((res: Usuario[]) => this.listarUsuarios = res);
  }

  public async goBack(): Promise<void> {
    await this.router.navigate(['']);
  }
  public async goCrear(): Promise<void> {
    await this.router.navigate(['/usuario/crear']);
  }
  public async goActualizar(): Promise<void> {
    await this.router.navigate(['/usuario/actualizar']);
  }
  public async goEliminar(): Promise<void> {
    await this.router.navigate(['/usuario/eliminar']);
  }
}


