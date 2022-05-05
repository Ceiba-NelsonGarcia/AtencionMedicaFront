import {AppPage} from '../app.po';
import {browser} from 'protractor';
import {CrearCitaPage} from '../page/cita/crearCita.po';

describe('workspace-project Cita', () => {
  let page: AppPage;
  let actualizarCita: CrearCitaPage;

  beforeEach(() => {
    page = new AppPage();
    actualizarCita = new CrearCitaPage();
  });

  it('Deberia ir a Crear cita', () => {
    page.navigateToCitaCrear();
    actualizarCita.ingresarIdUsuario('1');
    actualizarCita.ingresarIdDoctor('1');
    actualizarCita.ingresarFechaCita('2022-05-08');
    actualizarCita.ingresarHoraInicial('7');
    actualizarCita.ingresarHoraFinal('8');
    actualizarCita.agregar();
    expect(browser.getCurrentUrl()).toContain('http://localhost:4200/cita/crear');
  });
});
