import {by, element} from 'protractor';

export class CrearDoctorPage {

  private inputNombre = element(by.id('nombre'));
  private inputTarifa = element(by.id('tarifa'));
  private inputHorario = element(by.id('horario'));

  private linkAgregar = element(by.id('agregar'));
  private linkAtras = element((by.id('atras')));

  async ingresarNombre(nombre: any) {
    await this.inputNombre.sendKeys(nombre);
  }
  async ingresarTarifa(tarifa: any) {
    await this.inputTarifa.sendKeys(tarifa);
  }
  async ingresarHorario(horario: any) {
    await this.inputHorario.sendKeys(horario);
  }
  async agregar(){
    await this.linkAgregar.click();
  }
  async atras(){
    await this.linkAtras.click();
  }
}
