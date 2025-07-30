import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircularImage } from './circular-image';

describe('CircularImage', () => {
  let component: CircularImage;
  let fixture: ComponentFixture<CircularImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircularImage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircularImage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
