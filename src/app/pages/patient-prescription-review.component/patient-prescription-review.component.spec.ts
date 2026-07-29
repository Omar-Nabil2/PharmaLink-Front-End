import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPrescriptionReviewComponent } from './patient-prescription-review.component';

describe('PatientPrescriptionReviewComponent', () => {
  let component: PatientPrescriptionReviewComponent;
  let fixture: ComponentFixture<PatientPrescriptionReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientPrescriptionReviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientPrescriptionReviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
