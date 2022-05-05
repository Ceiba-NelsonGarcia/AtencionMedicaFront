import { browser, by, element } from 'protractor';

export class AppPage {
  navigateToHome() {
    return browser.get(browser.baseUrl + '/home') as Promise<any>;
  }
  // USUARIO
  navigateToUsuarioListar() {
    return browser.get(browser.baseUrl + '/usuario/listar') as Promise<any>;
  }
  navigateToUsuarioCrear() {
    return browser.get(browser.baseUrl + '/usuario/crear') as Promise<any>;
  }

  navigateToUsuarioActualizar() {
    return browser.get(browser.baseUrl + '/usuario/actualizar') as Promise<any>;
  }

  navigateToUsuarioEliminar() {
    return browser.get(browser.baseUrl + '/usuario/eliminar') as Promise<any>;
  }
  // DOCTOR
  navigateToDoctorListar() {
    return browser.get(browser.baseUrl + '/doctor/listar') as Promise<any>;
  }
  navigateToDoctorCrear() {
    return browser.get(browser.baseUrl + '/doctor/crear') as Promise<any>;
  }
  navigateToDoctorActualizar() {
    return browser.get(browser.baseUrl + '/doctor/actualizar') as Promise<any>;
  }
  navigateToDoctorEliminar() {
    return browser.get(browser.baseUrl + '/doctor/eliminar') as Promise<any>;
  }
  // CITA
  navigateToCitaListar() {
    return browser.get(browser.baseUrl + '/cita/listar') as Promise<any>;
  }

  navigateToCitaCrear() {
    return browser.get(browser.baseUrl + '/cita/crear') as Promise<any>;
  }

  navigateToCitaActualizar() {
    return browser.get(browser.baseUrl + '/cita/actualizar') as Promise<any>;
  }

  navigateToCitaEliminar() {
    return browser.get(browser.baseUrl + '/cita/eliminar') as Promise<any>;
  }

  getTitleText() {
    return element(by.css('h1')).getText() as Promise<string>;
  }
  currentUrl() {
    return browser.getCurrentUrl();
  }
}
