import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarDoctoresComponent } from './listar-doctores.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {DoctorService} from '../../shared/service/doctor.service';
import {Router} from '@angular/router';

describe('ListarDoctoresComponent', () => {
  let component: ListarDoctoresComponent;
  let fixture: ComponentFixture<ListarDoctoresComponent>;
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ ListarDoctoresComponent ],
      providers: [ DoctorService , {provide: Router, useValue: routerSpy}],
      schemas : [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarDoctoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Prueba componente listar doctor', () => {
    expect(component).toBeTruthy();
  });

  it('Enrutar a la pagina crear doctor', () => {
    component.goCrear();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/doctor/crear']);
  });

  it('Enrutar a la pagina actualizar doctor', () => {
    component.goActualizar();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/doctor/actualizar']);
  });

  it('Enrutar a la pagina eliminar doctor', () => {
    component.goEliminar();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/doctor/eliminar']);
  });
});
