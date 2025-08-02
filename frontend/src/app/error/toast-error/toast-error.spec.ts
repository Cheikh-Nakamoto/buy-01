import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastError } from './toast-error';

describe('ToastError', () => {
  let component: ToastError;
  let fixture: ComponentFixture<ToastError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastError]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastError);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
