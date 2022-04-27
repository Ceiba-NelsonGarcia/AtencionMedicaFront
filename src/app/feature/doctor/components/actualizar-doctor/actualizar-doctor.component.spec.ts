import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarDoctorComponent } from './actualizar-doctor.component';

describe('ActualizarDoctorComponent', () => {
  let component: ActualizarDoctorComponent;
  let fixture: ComponentFixture<ActualizarDoctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActualizarDoctorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualizarDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
