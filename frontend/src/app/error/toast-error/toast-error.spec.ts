import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastError } from './toast-error';
import { signal, WritableSignal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('ToastError', () => {
  let component: ToastError;
  let fixture: ComponentFixture<ToastError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastError],
      providers: [
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastError);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with visible false and percentage 0', () => {
    expect(component.visible()).toBeFalse();
    expect(component.percentage()).toBe(0);
  });

  it('should show toast when currentNotification has an error message', () => {
    (component.currentNotification as WritableSignal<{ error: string, success: string } | undefined>).set({ error: 'Test Error', success: '' });
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.showToast()).toBeTrue();
    expect(component.toastTitle()).toBe('Something went wrong');
    expect(component.toastDetail()).toBe('Test Error');
    expect(component.messageType()).toBe('error');
  });

  it('should show toast when currentNotification has a success message', () => {
    (component.currentNotification as WritableSignal<{ error: string, success: string } | undefined>).set({ error: '', success: 'Test Success' });
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.showToast()).toBeTrue();
    expect(component.toastTitle()).toBe('Succès');
    expect(component.toastDetail()).toBe('Test Success');
    expect(component.messageType()).toBe('success');
  });

  it('should not show toast when currentNotification is undefined', () => {
    (component.currentNotification as WritableSignal<{ error: string, success: string } | undefined>).set(undefined);
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.showToast()).toBeFalse();
  });

  it('should toggle toast visibility', () => {
    (component.currentNotification as WritableSignal<{ error: string, success: string } | undefined>).set({ error: 'Test Error', success: '' });
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.visible()).toBeTrue();
    component.toggleToast();
    fixture.detectChanges(); // Add detectChanges after toggle
    expect(component.visible()).toBeFalse();
    component.toggleToast();
    fixture.detectChanges(); // Add detectChanges after toggle
    expect(component.visible()).toBeTrue();
  });

  it('should update percentage on onTimerChange', () => {
    component.onTimerChange(1);
    expect(component.percentage()).toBe(25);
    component.onTimerChange(2);
    expect(component.percentage()).toBe(50);
  });

  it('should reset percentage to 0 when toast becomes invisible', () => {
    (component.currentNotification as WritableSignal<{ error: string, success: string } | undefined>).set({ error: 'Test Error', success: '' });
    component.ngOnInit();
    fixture.detectChanges();
    component.onTimerChange(2);
    expect(component.percentage()).toBe(50);
    component.onVisibleChange(false);
    fixture.detectChanges(); // Add detectChanges after onVisibleChange
    expect(component.percentage()).toBe(0);
  });

  it('should maintain percentage when toast remains visible', () => {
    (component.currentNotification as WritableSignal<{ error: string, success: string } | undefined>).set({ error: 'Test Error', success: '' });
    component.ngOnInit();
    fixture.detectChanges();
    component.onTimerChange(2);
    expect(component.percentage()).toBe(50);
    component.onVisibleChange(true);
    fixture.detectChanges(); // Add detectChanges after onVisibleChange
    expect(component.percentage()).toBe(50);
  });
});