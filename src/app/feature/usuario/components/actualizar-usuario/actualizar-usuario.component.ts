import { Component } from '@angular/core';
import { UsuarioService } from '../../Shared/service/usuario.service';
import { Router } from '@angular/router';
import { Usuario } from '../../Shared/model/usuario';

@Component({
  selector: 'app-actualizar-usuario',
  templateUrl: './actualizar-usuario.component.html',
  styleUrls: ['./actualizar-usuario.component.scss']
})
export class ActualizarUsuarioComponent{

  titulo = 'Actualizar Usuario';
  idUsuario: number;
  nombreUsuario: string;

  constructor(private router: Router, private usuarioService: UsuarioService) { }

  Actualizar(){
    const usuario: Usuario = {idUsuario: this.idUsuario, nombreUsuario: this.nombreUsuario};
    try{
      this.usuarioService.actualizarUsuario(this.idUsuario, usuario)
        .subscribe(data => console.log(data));
    } catch (error) {
      alert('Sucedió un error con la creación del usaurio');
    }
  }

  Atras(){
    this.router.navigate(['usuario/listar']);
  }
}
