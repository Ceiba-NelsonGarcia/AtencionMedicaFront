import {AppPage} from '../app.po';
import {browser} from 'protractor';
import {EliminarUsuarioPage} from '../page/usuario/eliminarUsuario.po';

describe('workspace-project Usuario', () => {
  let page: AppPage;
  let eliminarUsuario: EliminarUsuarioPage;

  beforeEach(() => {
    page = new AppPage();
    eliminarUsuario = new EliminarUsuarioPage();
  });

  it('Deberia ir a eliminar usuario', () => {
    page.navigateToUsuarioEliminar();
    eliminarUsuario.ingresarIdUsuario('1');
    eliminarUsuario.eliminar();
    expect(browser.getCurrentUrl()).toContain('/usuario/eliminar');
  });
});
