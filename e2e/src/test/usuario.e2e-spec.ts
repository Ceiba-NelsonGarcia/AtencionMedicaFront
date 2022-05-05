import {AppPage} from '../app.po';
import {browser} from 'protractor';
import {UsuarioPage} from '../page/usuario/usuario.po';

describe('workspace-project Usuario', () => {
  let page: AppPage;
  let usuario: UsuarioPage;

  beforeEach(() => {
    page = new AppPage();
    usuario = new UsuarioPage();
  });

  it('Deberia redenrizarse correctamente', () => {
    page.navigateToHome();
    page.navigateToUsuarioListar();
    usuario.getTitleFirstText();
    usuario.getTitleSecondText();
    usuario.getTitleThirdText();
    usuario.getTitleFourthText();
    expect(browser.getCurrentUrl()).toContain('/usuario/listar');
  });

  it('Deberia redirigir a home', () => {
    page.navigateToUsuarioListar();
    usuario.clickHomeButton();
    expect(browser.getCurrentUrl()).toContain('/home');
  });

  it('Deberia redirigir a Usaurio', () => {
    page.navigateToUsuarioListar();
    usuario.clickCrearButton();
    expect(browser.getCurrentUrl()).toContain('/usuario/crear');
  });

  it('Deberia redirigir a usuario actualizar', () => {
    page.navigateToUsuarioListar();
    usuario.clickActualizarButton();
    expect(browser.getCurrentUrl()).toContain('/usuario/actualizar');
  });

  it('Deberia redirigir a usuairo eliminar', () => {
    page.navigateToUsuarioListar();
    usuario.clickEliminarButton();
    expect(browser.getCurrentUrl()).toContain('/usuario/eliminar');
  });
});
