import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpService} from '../../../../core/services/http.service';
import { Usuario, CrearUsuarioDTO } from '../model/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(
    private httpService: HttpService
  ) { }

  private urlGet = 'http://localhost:8083/AtencionMedica/usuarios';
  private urlPost = 'http://localhost:8083/AtencionMedica/usuarios/crear';
  private urlPut = 'http://localhost:8083/AtencionMedica/usuarios/';

  public consultar(): Observable<Usuario[]> {
    return this.httpService.get<Usuario[]>(this.urlGet);
  }
  //  return this.httpService.delete(`${this.url}/${id}`);
  public actualizarUsuario(credenciales: object): any {
    return this.httpService.put(this.urlPut, credenciales);
  }

  //Observable<Variable>
  public crearUsuario(dtoUsuario: CrearUsuarioDTO): any {
    console.log("Metodo crear usuairo")
    return this.httpService.post<CrearUsuarioDTO, number>(this.urlPost, dtoUsuario);
  }
}
