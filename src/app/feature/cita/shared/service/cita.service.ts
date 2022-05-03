import { Injectable } from '@angular/core';
import {HttpService} from '@core-service/http.service';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {Cita, CitaDTO} from '../model/Cita';


@Injectable()
export class CitaService {

  constructor(private httpService: HttpService) { }

  public consultar(): Observable<Cita[]> {
    return this.httpService.get<Cita[]>(`${environment.endpoint}/citas`);
  }

  public actualizarCita(id: number, cita: Cita): Observable<Cita> {
    return this.httpService.put(`${environment.endpoint}/citas/${id}`, cita);
  }

  public crearCita(dtoCita: CitaDTO): Observable<number> {
    return this.httpService.post<CitaDTO, number>(`${environment.endpoint}/citas/crear`, dtoCita);
  }

  public eliminarCita(id: number): Observable<Cita> {
    return this.httpService.delete(`${environment.endpoint}/citas/${id}`);
  }
}

