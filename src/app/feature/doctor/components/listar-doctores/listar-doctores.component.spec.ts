import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarDoctoresComponent } from './listar-doctores.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {DoctorService} from '../../shared/service/doctor.service';

describe('ListarDoctoresComponent', () => {
  let component: ListarDoctoresComponent;
  let fixture: ComponentFixture<ListarDoctoresComponent>;

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
    fixture = TestBed.createComponent(ListarDoctoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
