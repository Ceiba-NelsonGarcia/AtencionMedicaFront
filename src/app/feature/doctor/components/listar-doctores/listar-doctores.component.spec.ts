import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarDoctoresComponent } from './listar-doctores.component';

describe('ListarDoctoresComponent', () => {
  let component: ListarDoctoresComponent;
  let fixture: ComponentFixture<ListarDoctoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarDoctoresComponent ]
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
