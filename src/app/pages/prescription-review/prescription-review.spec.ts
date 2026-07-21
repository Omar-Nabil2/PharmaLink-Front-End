import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionReview } from './prescription-review';

describe('PrescriptionReview', () => {
  let component: PrescriptionReview;
  let fixture: ComponentFixture<PrescriptionReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionReview],
    }).compileComponents();

    fixture = TestBed.createComponent(PrescriptionReview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
