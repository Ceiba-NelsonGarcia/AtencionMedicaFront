import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';


export interface Options {
  headers?: HttpHeaders;
}
@Injectable({
  providedIn: 'root'
})

export class HttpService {


  constructor(
    private httpClient: HttpClient
  ) {
  }

  get<T>(url: string): Observable<T> {
    const options = this.createOptionsHeaders();
    return this.httpClient.get<T>(url, options);
  }

  put<T, R>(url: string, body: T): Observable<R> {
    const options = this.createOptionsHeaders();
    return this.httpClient.put<R>(url, body, options);
  }

  post<T, R>(url: string, body: T): Observable<R> {
    const options = this.createOptionsHeaders();
    console.log("Metodo post Service")
    return this.httpClient.post<R>(url, body, options);
  }

  delete<T>(url: string): Observable<T> {
    const options = this.createOptionsHeaders();
    return this.httpClient.delete<T>(url, options);
  }

  private createOptionsHeaders(): Options {
    return {
      headers: new HttpHeaders().set('Type-content', 'aplication/json')
    };
  }

}
