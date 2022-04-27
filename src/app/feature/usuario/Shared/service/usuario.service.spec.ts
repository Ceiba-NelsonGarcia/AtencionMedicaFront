import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
const usuarioServiceSpy = jasmine.createSpyObj('UsuarioService', ['consultar']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [ UsuarioService ],
      providers: [{provide: UsuarioService, useValue: usuarioServiceSpy }, {}]
    })
    .compileComponents();
  });

  it('should be created', () => {
    expect(usuarioServiceSpy).toBeTruthy();
  });
});
