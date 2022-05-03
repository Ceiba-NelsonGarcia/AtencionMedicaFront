import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarUsuariosComponent } from './listar-usuarios.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {UsuarioService} from '../../Shared/service/usuario.service';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {RouterTestingModule} from '@angular/router/testing';

describe('ListarUsuariosComponent', () => {
  let component: ListarUsuariosComponent;
  let fixture: ComponentFixture<ListarUsuariosComponent>;

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
    fixture = TestBed.createComponent(ListarUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
