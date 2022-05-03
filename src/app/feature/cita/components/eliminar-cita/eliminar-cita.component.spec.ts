import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarCitaComponent } from './eliminar-cita.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ListarCitasComponent} from '../listar-citas/listar-citas.component';
import {CitaService} from '../../shared/service/cita.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {NO_ERRORS_SCHEMA} from '@angular/core';

describe('EliminarCitaComponent', () => {
  let component: EliminarCitaComponent;
  let fixture: ComponentFixture<EliminarCitaComponent>;

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
    fixture = TestBed.createComponent(EliminarCitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
