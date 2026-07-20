import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparationList } from './preparation-list';

describe('PreparationList', () => {
  let component: PreparationList;
  let fixture: ComponentFixture<PreparationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreparationList],
    }).compileComponents();

    fixture = TestBed.createComponent(PreparationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
