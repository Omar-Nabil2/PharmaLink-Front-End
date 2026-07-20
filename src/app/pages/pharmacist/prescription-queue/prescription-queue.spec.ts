import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionQueue } from './prescription-queue';

describe('PrescriptionQueue', () => {
  let component: PrescriptionQueue;
  let fixture: ComponentFixture<PrescriptionQueue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionQueue],
    }).compileComponents();

    fixture = TestBed.createComponent(PrescriptionQueue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
