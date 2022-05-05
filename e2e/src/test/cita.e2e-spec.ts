import {AppPage} from '../app.po';
import {browser} from 'protractor';
import {CitaPage} from '../page/cita/cita.po';

describe('workspace-project Cita', () => {
  let page: AppPage;
  let cita: CitaPage;

  beforeEach(() => {
    page = new AppPage();
    cita = new CitaPage();
  });

  it('Deberia redenrizarse correctamente', () => {
    page.navigateToCitaListar();
    cita.getTitleFirstText();
    cita.getTitleSecondText();
    cita.getTitleThirdText();
    cita.getTitleFourthText();
    expect(browser.getCurrentUrl()).toContain('/cita/listar');
  });

  it('Deberia redirigir a home', () => {
    page.navigateToCitaListar();
    cita.clickHomeButton();
    expect(browser.getCurrentUrl()).toContain('/home');
  });

  it('Deberia redirigir a cita', () => {
    page.navigateToCitaListar();
    cita.clickCrearButton();
    expect(browser.getCurrentUrl()).toContain('/cita/crear');
  });

  it('Deberia redirigir a cita actualizar', () => {
    page.navigateToCitaListar();
    cita.clickActualizarButton();
    expect(browser.getCurrentUrl()).toContain('/cita/actualizar');
  });

  it('Deberia redirigir a usuairo eliminar', () => {
    page.navigateToCitaListar();
    cita.clickEliminarButton();
    expect(browser.getCurrentUrl()).toContain('/cita/eliminar');
  });
});
