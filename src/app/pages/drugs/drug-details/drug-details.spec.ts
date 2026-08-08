import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugDetails } from './drug-details';

describe('DrugDetails', () => {
  let component: DrugDetails;
  let fixture: ComponentFixture<DrugDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrugDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(DrugDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
