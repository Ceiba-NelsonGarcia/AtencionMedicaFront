import {by, element} from 'protractor';

export class HomePage {
  private usuariosButton = element(by.id('usuarios'));
  private doctoresButton = element(by.id('doctores'));
  private citasButton = element(by.id('citas'));

  getTitleFirstText() {
    return this.usuariosButton.getText() as Promise<string>;
  }

  getTitleSecondText() {
    return this.doctoresButton.getText() as Promise<string>;
  }

  getTitleThirdText() {
    return this.citasButton.getText() as Promise<string>;
  }

  async clickUsuriosButton() {
    await this.usuariosButton.click();
  }

  async clickDoctoresButton() {
    await this.doctoresButton.click();
  }

  async clickCitasButton() {
    await this.citasButton.click();
  }
}
