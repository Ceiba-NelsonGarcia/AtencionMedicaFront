import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarCitasComponent } from './listar-citas.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {CitaService} from '../../shared/service/cita.service';

describe('ListarCitasComponent', () => {
  let component: ListarCitasComponent;
  let fixture: ComponentFixture<ListarCitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ ListarCitasComponent ],
      providers: [ CitaService ],
      schemas : [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarCitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
