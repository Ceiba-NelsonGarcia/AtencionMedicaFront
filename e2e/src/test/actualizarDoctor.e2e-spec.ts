import {AppPage} from '../app.po';
import {browser} from 'protractor';
import {ActualizarDoctorPage} from '../page/doctor/actualizarDoctor.po';

describe('workspace-project Doctor', () => {
  let page: AppPage;
  let ActualizarDoctor: ActualizarDoctorPage;

  beforeEach(() => {
    page = new AppPage();
    ActualizarDoctor = new ActualizarDoctorPage();
  });

  it('Deberia ir a Actualizar doctor', () => {
    page.navigateToDoctorActualizar();
    ActualizarDoctor.ingresarIdDoctor('1');
    ActualizarDoctor.ingresarNombre('Doctor Test');
    ActualizarDoctor.ingresarTarifa('1');
    ActualizarDoctor.ingresarHorario('1');
    ActualizarDoctor.actualizar();
    expect(browser.getCurrentUrl()).toContain('http://localhost:4200/doctor/actualizar');
  });
});
