import { TestBed } from '@angular/core/testing';
import { DoctorService } from './doctor.service';
import {HttpClientModule} from '@angular/common/http';

describe('DoctorService', () => {

  const doctorServiceSpy = jasmine.createSpyObj('doctorService', ['consultar']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [ DoctorService ],
      providers: [{provide: DoctorService, useValue: doctorServiceSpy }, {}]
    });
  });

  it('should be created', () => {
    expect(doctorServiceSpy).toBeTruthy();
  });
});
