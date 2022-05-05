import {AppPage} from '../app.po';
import {browser} from 'protractor';
import {EliminarDoctorPage} from '../page/doctor/eliminarDocotor.po';

describe('workspace-project Doctor', () => {
  let page: AppPage;
  let eliminarDoctor: EliminarDoctorPage;

  beforeEach(() => {
    page = new AppPage();
    eliminarDoctor = new EliminarDoctorPage();
  });

  it('Deberia ir a eliminar doctor', () => {
    page.navigateToDoctorEliminar();
    eliminarDoctor.ingresarIdDoctor('1');
    eliminarDoctor.eliminar();
    expect(browser.getCurrentUrl()).toContain('/doctor/eliminar');
  });
});
