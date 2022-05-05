import { Component} from '@angular/core';
import { UsuarioService } from '../../Shared/service/usuario.service';
import { Router } from '@angular/router';
import { CrearUsuarioDTO } from '../../Shared/model/usuario';

@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.scss']
})
export class CrearUsuarioComponent{

  titulo = 'Crear Usuario';
  nombreUsuario: string;
  confirmacion = false;

  constructor(private router: Router, private usuarioService: UsuarioService) { }

  crear(){
    const usuarioDto: CrearUsuarioDTO = {nombreUsuario: this.nombreUsuario};
    try{
      this.usuarioService.crearUsuario(usuarioDto)
        .subscribe(data => console.log(data));
      this.confirmacion = true;
    } catch (error) {
      alert('Sucedió un error con la creación del usaurio');
    }
  }

  atras(){
    this.router.navigate(['usuario/listar']);
  }
}
