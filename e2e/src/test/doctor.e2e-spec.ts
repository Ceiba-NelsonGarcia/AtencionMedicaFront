import {AppPage} from '../app.po';
import {browser} from 'protractor';
import {DoctorPage} from '../page/doctor/doctor.po';

describe('workspace-project Doctor', () => {
  let page: AppPage;
  let doctor: DoctorPage;

  beforeEach(() => {
    page = new AppPage();
    doctor = new DoctorPage();
  });

  it('Deberia redenrizarse correctamente', () => {
    page.navigateToDoctorListar();
    doctor.getTitleFirstText();
    doctor.getTitleSecondText();
    doctor.getTitleThirdText();
    doctor.getTitleFourthText();
    expect(browser.getCurrentUrl()).toContain('/doctor/listar');
  });

  it('Deberia redirigir a home', () => {
    page.navigateToDoctorListar();
    doctor.clickHomeButton();
    expect(browser.getCurrentUrl()).toContain('/home');
  });

  it('Deberia redirigir a doctor', () => {
    page.navigateToDoctorListar();
    doctor.clickCrearButton();
    expect(browser.getCurrentUrl()).toContain('/doctor/crear');
  });

  it('Deberia redirigir a doctor actualizar', () => {
    page.navigateToDoctorListar();
    doctor.clickActualizarButton();
    expect(browser.getCurrentUrl()).toContain('/doctor/actualizar');
  });

  it('Deberia redirigir a usuairo eliminar', () => {
    page.navigateToDoctorListar();
    doctor.clickEliminarButton();
    expect(browser.getCurrentUrl()).toContain('/doctor/eliminar');
  });
});
