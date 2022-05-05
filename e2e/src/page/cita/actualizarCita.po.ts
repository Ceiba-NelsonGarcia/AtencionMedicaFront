import {by, element} from 'protractor';

export class ActualizarCitaPage {

  private inputIdCita = element(by.id('idCita'));
  private inputIdUsuario = element(by.id('idUsuario'));
  private inputIdDoctor = element(by.id('idDoctor'));
  private inputFechaCita = element(by.id('fechaCita'));
  private inputHoraInicial = element(by.id('horaInicial'));
  private inputHoraFinal = element(by.id('horaFinal'));

  private linkActualizar = element(by.id('actualizar'));
  private linkAtras = element((by.id('atras')));

  async ingresarIdCita(idCita: any) {
    await this.inputIdCita.sendKeys(idCita);
  }
  async ingresarIdUsuario(idUsuario: any) {
    await this.inputIdUsuario.sendKeys(idUsuario);
  }
  async ingresarIdDoctor(doctor: any) {
    await this.inputIdDoctor.sendKeys(doctor);
  }
  async ingresarFechaCita(fechaCita: any) {
    await this.inputFechaCita.sendKeys(fechaCita);
  }
  async ingresarHoraInicial(horaInicial: any) {
    await this.inputHoraInicial.sendKeys(horaInicial);
  }
  async ingresarHoraFinal(horaFinal: any) {
    await this.inputHoraFinal.sendKeys(horaFinal);
  }
  async actualizar(){
    await this.linkActualizar.click();
  }
  async atras(){
    await this.linkAtras.click();
  }
}
