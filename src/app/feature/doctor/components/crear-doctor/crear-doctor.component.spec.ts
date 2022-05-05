import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearDoctorComponent } from './crear-doctor.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ListarDoctoresComponent} from '../listar-doctores/listar-doctores.component';
import {DoctorService} from '../../shared/service/doctor.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {Router} from '@angular/router';
import {of} from 'rxjs';

describe('CrearDoctorComponent', () => {
  let component: CrearDoctorComponent;
  let fixture: ComponentFixture<CrearDoctorComponent>;

  const doctorServiceSpy = jasmine.createSpyObj('DoctorService', ['crearDoctor']);
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
    fixture = TestBed.createComponent(CrearDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(' Eliminar doctor exitosamente ', () => {
    doctorServiceSpy.crearDoctor.and.returnValue(of(''));
    component.crear();
    expect(component.confirmacion).toBeTruthy();
  });

  it('Devolverse al home de doctor',
    (): void => {
      component.atras();
      component.atras();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['doctor/listar']);
    });
});
