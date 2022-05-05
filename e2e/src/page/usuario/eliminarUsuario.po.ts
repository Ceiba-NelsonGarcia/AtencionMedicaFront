import {by, element} from 'protractor';

export class EliminarUsuarioPage {

  private inputIdUsuario = element(by.id('idUsuario'));

  private linkEliminar = element(by.id('eliminar'));
  private linkAtras = element((by.id('atras')));

  async ingresarIdUsuario(idUsuario: any) {
    await this.inputIdUsuario.sendKeys(idUsuario);
  }
  async eliminar(){
    await this.linkEliminar.click();
  }

  async atras(){
    await this.linkAtras.click();
  }
}
