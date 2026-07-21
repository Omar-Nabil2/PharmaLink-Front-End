import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparationListComponent } from './preparation-list';

describe('PreparationListComponent', () => {
  let component: PreparationListComponent;
  let fixture: ComponentFixture<PreparationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreparationListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PreparationListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
