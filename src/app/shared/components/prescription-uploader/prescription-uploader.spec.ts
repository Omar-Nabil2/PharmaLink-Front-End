import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionUploader } from './prescription-uploader';

describe('PrescriptionUploader', () => {
  let component: PrescriptionUploader;
  let fixture: ComponentFixture<PrescriptionUploader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionUploader],
    }).compileComponents();

    fixture = TestBed.createComponent(PrescriptionUploader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
