import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../../core/services/http.service';
import { Usuario, CrearUsuarioDTO } from '../model/usuario';
import { environment } from 'src/environments/environment';

@Injectable()
export class UsuarioService {

   constructor(private httpService: HttpService) { }

  public consultar(): Observable<Usuario[]> {
    return this.httpService.get<Usuario[]>(`${environment.endpoint}/usuarios`);
  }

  public actualizarUsuario(id: number, usuairo: Usuario): Observable<Usuario> {
    return this.httpService.put(`${environment.endpoint}/usuarios/${id}`, usuairo);
  }

  public crearUsuario(dtoUsuario: CrearUsuarioDTO): Observable<number> {
    return this.httpService.post<CrearUsuarioDTO, number>(`${environment.endpoint}/usuarios/crear`, dtoUsuario);
  }

  public eliminarUsuario(id: number): Observable<Usuario> {
    return this.httpService.delete(`${environment.endpoint}/usuarios/${id}`);
  }
}
