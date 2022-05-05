import {by, element} from 'protractor';

export class DoctorPage {
  private homeButton = element(by.id('home'));
  private crearButton = element(by.id('crear'));
  private actualizarButton = element(by.id('actualizar'));
  private eliminarButton = element(by.id('eliminar'));

  getTitleFirstText() {
    return this.homeButton.getText() as Promise<string>;
  }

  getTitleSecondText() {
    return this.crearButton.getText() as Promise<string>;
  }

  getTitleThirdText() {
    return this.actualizarButton.getText() as Promise<string>;
  }

  getTitleFourthText() {
    return this.eliminarButton.getText() as Promise<string>;
  }

  async clickHomeButton() {
    await this.homeButton.click();
  }

  async clickCrearButton() {
    await this.crearButton.click();
  }

  async clickActualizarButton() {
    await this.actualizarButton.click();
  }

  async clickEliminarButton() {
    await this.eliminarButton.click();
  }
}
