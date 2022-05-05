import {by, element} from 'protractor';

export class EliminarDoctorPage {

  private inputIdDoctor = element(by.id('idDoctor'));

  private linkEliminar = element(by.id('eliminar'));
  private linkAtras = element((by.id('atras')));

  async ingresarIdDoctor(idDoctor: any) {
    await this.inputIdDoctor.sendKeys(idDoctor);
  }
  async eliminar(){
    await this.linkEliminar.click();
  }

  async atras(){
    await this.linkAtras.click();
  }
}
