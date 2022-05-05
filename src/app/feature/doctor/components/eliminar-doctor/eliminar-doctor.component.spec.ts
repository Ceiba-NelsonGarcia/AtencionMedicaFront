import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarDoctorComponent } from './eliminar-doctor.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ListarDoctoresComponent} from '../listar-doctores/listar-doctores.component';
import {DoctorService} from '../../shared/service/doctor.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {of} from 'rxjs';
import {Router} from '@angular/router';

describe('EliminarDoctorComponent', () => {
  let component: EliminarDoctorComponent;
  let fixture: ComponentFixture<EliminarDoctorComponent>;

  const doctorServiceSpy = jasmine.createSpyObj('DoctorService', ['eliminarDoctor']);
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ ListarDoctoresComponent ],
      providers: [ DoctorService, {provider: DoctorService, useValue: doctorServiceSpy},
                                  {provide: Router, useValue: routerSpy}
                  ],
      schemas : [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EliminarDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(' Prueba componente eliminar doctor ', () => {
    expect(component).toBeTruthy();
  });

  it(' Eliminar doctor exitosamente ', () => {
    doctorServiceSpy.eliminarDoctor.and.returnValue(of(''));
    component.eliminar();
    expect(component.confirmacion).toBeTruthy();
  });

  it('Devolverse al home de doctor',
    (): void => {
      component.atras();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['doctor/listar']);
    });
});
