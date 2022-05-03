import { Component } from '@angular/core';
import { UsuarioService } from '../../Shared/service/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-eliminar-usuario',
  templateUrl: './eliminar-usuario.component.html',
  styleUrls: ['./eliminar-usuario.component.scss']
})
export class EliminarUsuarioComponent{

  titulo = 'Eliminar Usuario';
  idUsuario: number;

  constructor(private router: Router, private usuarioService: UsuarioService) { }

  Eliminar(){
    try{
      this.usuarioService.eliminarUsuario(this.idUsuario)
        .subscribe(data => console.log(data));
    } catch (error) {
      alert('Sucedio un error con la eliminacion del usaurio');
    }
  }

  Atras(){
    this.router.navigate(['usuario/listar']);
  }
}
