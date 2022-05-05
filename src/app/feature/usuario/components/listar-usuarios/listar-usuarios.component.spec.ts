import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarUsuariosComponent } from './listar-usuarios.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {UsuarioService} from '../../Shared/service/usuario.service';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {RouterTestingModule} from '@angular/router/testing';
import {Router} from '@angular/router';

describe('ListarUsuariosComponent', () => {
  let component: ListarUsuariosComponent;
  let fixture: ComponentFixture<ListarUsuariosComponent>;
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ ListarUsuariosComponent ],
      providers: [ UsuarioService, {provide: Router, useValue: routerSpy} ],
      schemas : [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Prueba componente listar usuarios', () => {
    expect(component).toBeTruthy();
  });

  it('Enrutar al home ', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
  });

  it('Enrutar a la pagina crear usuario', () => {
    component.goCrear();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/usuario/crear']);
  });

  it('Enrutar a la pagina actualizar usuario', () => {
    component.goActualizar();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/usuario/actualizar']);
  });

  it('Enrutar a la pagina eliminar usuario', () => {
    component.goEliminar();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/usuario/eliminar']);
  });
});
