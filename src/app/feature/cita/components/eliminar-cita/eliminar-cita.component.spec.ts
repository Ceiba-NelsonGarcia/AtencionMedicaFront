import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarCitaComponent } from './eliminar-cita.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ListarCitasComponent} from '../listar-citas/listar-citas.component';
import {CitaService} from '../../shared/service/cita.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {Router} from '@angular/router';
import {of} from 'rxjs';

describe('EliminarCitaComponent', () => {
  let component: EliminarCitaComponent;
  let fixture: ComponentFixture<EliminarCitaComponent>;

  const citaServiceSpy = jasmine.createSpyObj('CitaService', ['eliminarCita']);
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ ListarCitasComponent ],
      providers: [ CitaService, {provider: CitaService, useValue: citaServiceSpy},
                    {provide: Router, useValue: routerSpy}
                  ],
      schemas : [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EliminarCitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Prueba componente eliminar cita', () => {
    expect(component).toBeTruthy();
  });

  it(' Eliminar cita exitosamente ', () => {
    citaServiceSpy.eliminarCita.and.returnValue(of(''));
    component.eliminar();
    expect(component.confirmacion).toBeTruthy();
  });

  it('Devolverse al home de cita',
    (): void => {
      component.atras();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['cita/listar']);
    });
});
