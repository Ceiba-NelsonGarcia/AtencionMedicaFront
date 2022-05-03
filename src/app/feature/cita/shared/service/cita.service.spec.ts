import { TestBed } from '@angular/core/testing';
import { CitaService } from './cita.service';
import {HttpClientModule} from '@angular/common/http';

describe('CitaService', () => {
  const citaServiceSpy = jasmine.createSpyObj('CitaService', ['consultar']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [ CitaService ],
      providers: [{provide: CitaService, useValue: citaServiceSpy }, {}]
    });
  });

  it('should be created', () => {
    expect(citaServiceSpy).toBeTruthy();
  });
});
