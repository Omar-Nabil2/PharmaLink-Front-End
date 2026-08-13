import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRecurring } from './create-recurring';

describe('CreateRecurring', () => {
  let component: CreateRecurring;
  let fixture: ComponentFixture<CreateRecurring>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRecurring],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRecurring);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
