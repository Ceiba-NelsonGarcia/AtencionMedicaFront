import {AppPage} from '../app.po';
import {browser} from 'protractor';
import {HomePage} from '../page/home/home.po';

describe('workspace-project Usuario', () => {
  let page: AppPage;
  let home: HomePage;

  beforeEach(() => {
    page = new AppPage();
    home = new HomePage();
  });

  it('Deberia redenrizarse correctamente', () => {
    page.navigateToHome();
    home.getTitleFirstText();
    home.getTitleSecondText();
    home.getTitleThirdText();
    expect(browser.getCurrentUrl()).toContain('/home');
  });

  it('Deberia redirigir a Usaurio', () => {
    page.navigateToHome();
    home.clickUsuriosButton();
    expect(browser.getCurrentUrl()).toContain('/usuario/listar');
  });

  it('Deberia redirigir a Doctor', () => {
    page.navigateToHome();
    home.clickDoctoresButton();
    expect(browser.getCurrentUrl()).toContain('/doctor/listar');
  });

  it('Deberia redirigir a Cita', () => {
    page.navigateToHome();
    home.clickCitasButton();
    expect(browser.getCurrentUrl()).toContain('/cita/listar');
  });
});
