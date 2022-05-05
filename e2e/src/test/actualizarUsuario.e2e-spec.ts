import {AppPage} from '../app.po';
import {browser} from 'protractor';
import {ActualizarUsuarioPage} from '../page/usuario/actualizarUsuario.po';

describe('workspace-project Usuario', () => {
  let page: AppPage;
  let actualizarUsuario: ActualizarUsuarioPage;

  beforeEach(() => {
    page = new AppPage();
    actualizarUsuario = new ActualizarUsuarioPage();
  });

  it('Deberia ir a Actualizar usuario', () => {
    page.navigateToUsuarioActualizar();
    actualizarUsuario.ingresarIdUsuario('1');
    actualizarUsuario.ingresarNombre('Usuario Test');
    actualizarUsuario.actualizar();
    expect(browser.getCurrentUrl()).toContain('http://localhost:4200/usuario/actualizar');
  });
});
