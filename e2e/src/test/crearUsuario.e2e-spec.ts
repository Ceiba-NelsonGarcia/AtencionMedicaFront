import {AppPage} from '../app.po';
import {browser} from 'protractor';
import {AgregarUsuarioPage} from '../page/usuario/crearUsuario.po';

describe('workspace-project Usuario', () => {
  let page: AppPage;
  let agregarUsuario: AgregarUsuarioPage;

  beforeEach(() => {
    page = new AppPage();
    agregarUsuario = new AgregarUsuarioPage();
  });

  it('Deberia ir a Agregar usuario', () => {
    page.navigateToUsuarioCrear();
    agregarUsuario.ingresarNombre('Usuario Test');
    agregarUsuario.agregar();
    expect(browser.getCurrentUrl()).toContain('http://localhost:4200/usuario/crear');
  });
});
