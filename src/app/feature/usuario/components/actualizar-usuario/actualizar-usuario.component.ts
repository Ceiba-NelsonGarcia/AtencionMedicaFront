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
  confirmacion = false;

  constructor(private router: Router, private usuarioService: UsuarioService) { }

  actualizar(){
    try{
      const usuario: Usuario = {idUsuario: this.idUsuario, nombreUsuario: this.nombreUsuario};
      this.usuarioService.actualizarUsuario(this.idUsuario, usuario)
        .subscribe(data => console.log(data));
      this.confirmacion = true;
    } catch (error) {
      alert('Sucedio un error con la creacion del usaurio');
    }
  }

  public async atras() {
    this.router.navigate(['usuario/listar']);
  }
}
