import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActualizarUsuarioComponent } from './actualizar-usuario.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ListarUsuariosComponent} from '../listar-usuarios/listar-usuarios.component';
import {UsuarioService} from '../../Shared/service/usuario.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import { Router } from '@angular/router';
import {of} from 'rxjs';

describe('ActualizarUsuarioComponent',
  () => {
    let component: ActualizarUsuarioComponent;
    let fixture: ComponentFixture<ActualizarUsuarioComponent>;
    const usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['actualizarUsuario']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HttpClientTestingModule, RouterTestingModule],
        declarations: [ListarUsuariosComponent],
        providers: [ UsuarioService, {provider: UsuarioService, useValue: usuarioServiceSpy},
                    {provide: Router, useValue: routerSpy}
                    ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
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

    it(' Actualizar usuario exitosamente ', () => {
      usuarioServiceSpy.actualizarUsuario.and.returnValue(of(''));
      component.actualizar();
      expect(component.confirmacion).toBeTruthy();
    });

    it('Devolverse al home de usaurios',
      (): void => {
        component.atras();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['usuario/listar']);
      });
  });
