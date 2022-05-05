import {AppPage} from '../app.po';
import {browser} from 'protractor';
import {CrearDoctorPage} from '../page/doctor/crearDoctor.po';

describe('workspace-project Doctor', () => {
  let page: AppPage;
  let CrearDoctor: CrearDoctorPage;

  beforeEach(() => {
    page = new AppPage();
    CrearDoctor = new CrearDoctorPage();
  });

  it('Deberia ir a Crear doctor', () => {
    page.navigateToDoctorCrear();
    CrearDoctor.ingresarNombre('Doctor Test');
    CrearDoctor.ingresarTarifa('1');
    CrearDoctor.ingresarHorario('1');
    CrearDoctor.agregar();
    expect(browser.getCurrentUrl()).toContain('http://localhost:4200/doctor/crear');
  });
});
