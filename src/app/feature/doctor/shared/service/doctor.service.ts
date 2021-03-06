import { Injectable } from '@angular/core';
import { HttpService } from '@core-service/http.service';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Doctor, DoctorDTO } from '../model/doctor';


@Injectable()
export class DoctorService {

  constructor(private httpService: HttpService) { }

  public consultar(): Observable<Doctor[]> {
    return this.httpService.get<Doctor[]>(`${environment.endpoint}/doctores`);
  }

  public actualizarDoctor(id: number, doctor: Doctor): Observable<Doctor> {
    return this.httpService.put(`${environment.endpoint}/doctores/${id}`, doctor);
  }

  public crearDoctor(dtoDoctor: DoctorDTO): Observable<number> {
    return this.httpService.post<DoctorDTO, number>(`${environment.endpoint}/doctores/crear`, dtoDoctor);
  }

  public eliminarDoctor(id: number): Observable<Doctor> {
    return this.httpService.delete(`${environment.endpoint}/doctores/${id}`);
  }
}
