import {by, element} from 'protractor';

export class EliminarCitaPage {

  private inputIdCita = element(by.id('idCita'));

  private linkEliminar = element(by.id('eliminar'));
  private linkAtras = element((by.id('atras')));

  async ingresarIdCita(idCita: any) {
    await this.inputIdCita.sendKeys(idCita);
  }
  async eliminar(){
    await this.linkEliminar.click();
  }

  async atras(){
    await this.linkAtras.click();
  }
}
