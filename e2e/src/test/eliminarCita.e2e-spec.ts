import {AppPage} from '../app.po';
import {browser} from 'protractor';
import {EliminarCitaPage} from '../page/cita/eliminarCita.po';

describe('workspace-project Cita', () => {
  let page: AppPage;
  let eliminarCita: EliminarCitaPage;

  beforeEach(() => {
    page = new AppPage();
    eliminarCita = new EliminarCitaPage();
  });

  it('Deberia ir a eliminar cita', () => {
    page.navigateToCitaEliminar();
    eliminarCita.ingresarIdCita('1');
    eliminarCita.eliminar();
    expect(browser.getCurrentUrl()).toContain('/cita/eliminar');
  });
});
