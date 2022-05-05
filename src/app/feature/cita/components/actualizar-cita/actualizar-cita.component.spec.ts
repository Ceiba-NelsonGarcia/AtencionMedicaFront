import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarCitaComponent } from './actualizar-cita.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ListarCitasComponent} from '../listar-citas/listar-citas.component';
import {CitaService} from '../../shared/service/cita.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {Router} from '@angular/router';
import {of} from 'rxjs';

describe('ActualizarCitaComponent', () => {
  let component: ActualizarCitaComponent;
  let fixture: ComponentFixture<ActualizarCitaComponent>;

  const citaServiceSpy = jasmine.createSpyObj('CitaService', ['actualizarCita']);
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ ListarCitasComponent ],
      providers: [ CitaService , {provider: CitaService, useValue: citaServiceSpy},
                    {provide: Router, useValue: routerSpy}
                  ],
      schemas : [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualizarCitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(' Eliminar cita exitosamente ', () => {
    citaServiceSpy.actualizarCita.and.returnValue(of(''));
    component.actualizar();
    expect(component.confirmacion).toBeTruthy();
  });

  it('Devolverse al home de cita',
    (): void => {
      component.atras();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['cita/listar']);
    });
});
