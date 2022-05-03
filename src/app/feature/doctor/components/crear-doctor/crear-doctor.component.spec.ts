import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearDoctorComponent } from './crear-doctor.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ListarDoctoresComponent} from '../listar-doctores/listar-doctores.component';
import {DoctorService} from '../../shared/service/doctor.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {NO_ERRORS_SCHEMA} from '@angular/core';

describe('CrearDoctorComponent', () => {
  let component: CrearDoctorComponent;
  let fixture: ComponentFixture<CrearDoctorComponent>;

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
    fixture = TestBed.createComponent(CrearDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
