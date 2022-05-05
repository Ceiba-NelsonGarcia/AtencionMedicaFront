import {by, element} from 'protractor';

export class ActualizarDoctorPage {

  private inputIdDoctor = element(by.id('idDoctor'));
  private inputNombre = element(by.id('nombre'));
  private inputTarifa = element(by.id('tarifa'));
  private inputHorario = element(by.id('horario'));

  private linkActualizar = element(by.id('actualizar'));
  private linkAtras = element((by.id('atras')));

  async ingresarIdDoctor(idDoctor: any) {
    await this.inputIdDoctor.sendKeys(idDoctor);
  }
  async ingresarNombre(nombre: any) {
    await this.inputNombre.sendKeys(nombre);
  }
  async ingresarTarifa(tarifa: any) {
    await this.inputTarifa.sendKeys(tarifa);
  }
  async ingresarHorario(horario: any) {
    await this.inputHorario.sendKeys(horario);
  }
  async actualizar(){
    await this.linkActualizar.click();
  }
  async atras(){
    await this.linkAtras.click();
  }
}
