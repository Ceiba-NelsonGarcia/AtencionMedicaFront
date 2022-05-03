import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarDoctorComponent } from './actualizar-doctor.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ListarDoctoresComponent} from '../listar-doctores/listar-doctores.component';
import {DoctorService} from '../../shared/service/doctor.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {NO_ERRORS_SCHEMA} from '@angular/core';

describe('ActualizarDoctorComponent', () => {
  let component: ActualizarDoctorComponent;
  let fixture: ComponentFixture<ActualizarDoctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ ListarDoctoresComponent ],
      providers: [ DoctorService ],
      schemas : [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualizarDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
