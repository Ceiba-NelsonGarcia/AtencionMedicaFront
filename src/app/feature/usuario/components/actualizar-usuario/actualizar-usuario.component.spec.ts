import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarUsuarioComponent } from './actualizar-usuario.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ListarUsuariosComponent} from '../listar-usuarios/listar-usuarios.component';
import {UsuarioService} from '../../Shared/service/usuario.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {NO_ERRORS_SCHEMA} from '@angular/core';

describe('ActualizarUsuarioComponent', () => {
  let component: ActualizarUsuarioComponent;
  let fixture: ComponentFixture<ActualizarUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, RouterTestingModule ],
      declarations: [ ListarUsuariosComponent ],
      providers: [ UsuarioService ],
      schemas : [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualizarUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
