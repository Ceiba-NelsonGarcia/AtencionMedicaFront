import {by, element} from 'protractor';

export class AgregarUsuarioPage {

  private inputNombre = element(by.id('nombre'));

  private linkAgregar = element(by.id('agregar'));
  private linkAtras = element((by.id('atras')));

  async ingresarNombre(nombre: any) {
    await this.inputNombre.sendKeys(nombre);
  }

  async agregar(){
    await this.linkAgregar.click();
  }
  async atras(){
    await this.linkAtras.click();
  }
}
