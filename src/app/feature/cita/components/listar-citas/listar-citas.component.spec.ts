import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarCitasComponent } from './listar-citas.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {CitaService} from '../../shared/service/cita.service';
import {Router} from '@angular/router';

describe('ListarCitasComponent', () => {
  let component: ListarCitasComponent;
  let fixture: ComponentFixture<ListarCitasComponent>;
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ ListarCitasComponent ],
      providers: [ CitaService, {provide: Router, useValue: routerSpy} ],
      schemas : [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarCitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Prueba componente listar citas', () => {
    expect(component).toBeTruthy();
  });

  it('Enrutar a la pagina crear cita', () => {
    component.goCrear();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/cita/crear']);
  });

  it('Enrutar a la pagina actualizar cita ', () => {
    component.goActualizar();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/cita/actualizar']);
  });

  it('Enrutar a la pagina eliminar usuario', () => {
    component.goEliminar();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/cita/eliminar']);
  });
});
