import {AppPage} from '../app.po';
import {browser} from 'protractor';
import {ActualizarCitaPage} from '../page/cita/actualizarCita.po';

describe('workspace-project Cita', () => {
  let page: AppPage;
  let actualizarCita: ActualizarCitaPage;

  beforeEach(() => {
    page = new AppPage();
    actualizarCita = new ActualizarCitaPage();
  });

  it('Deberia ir a Actualizar cita', () => {
    page.navigateToCitaActualizar();
    actualizarCita.ingresarIdCita('1');
    actualizarCita.ingresarIdUsuario('1');
    actualizarCita.ingresarIdDoctor('1');
    actualizarCita.ingresarFechaCita('2022-05-08');
    actualizarCita.ingresarHoraInicial('7');
    actualizarCita.ingresarHoraFinal('8');
    actualizarCita.actualizar();
    expect(browser.getCurrentUrl()).toContain('http://localhost:4200/cita/actualizar');
  });
});
