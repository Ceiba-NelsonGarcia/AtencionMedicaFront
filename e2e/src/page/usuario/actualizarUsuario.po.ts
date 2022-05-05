import {by, element} from 'protractor';

export class ActualizarUsuarioPage {

  private inputIdUsuario = element(by.id('idUsuario'));
  private inputNombre = element(by.id('nombre'));

  private linkActualizar = element(by.id('actualizar'));
  private linkAtras = element((by.id('atras')));

  async ingresarIdUsuario(idUsuario: any) {
    await this.inputIdUsuario.sendKeys(idUsuario);
  }
  async ingresarNombre(nombre: any) {
    await this.inputNombre.sendKeys(nombre);
  }

  async actualizar(){
    await this.linkActualizar.click();
  }
  async atras(){
    await this.linkAtras.click();
  }
}
