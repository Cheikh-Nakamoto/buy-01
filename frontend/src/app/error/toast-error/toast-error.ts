import { Component, computed, input, Input, OnInit, Signal, signal } from '@angular/core';
import { ButtonDirective, ProgressComponent, ToasterComponent, ToastComponent, ToastHeaderComponent, ToastBodyComponent } from '@coreui/angular';
import { ToastSampleIconComponent } from './toast-sample-icon-compenant';

@Component({
  selector: 'app-toast-error',
  imports: [
    ProgressComponent,
    ToasterComponent,
    ToastComponent,
    ToastHeaderComponent,
    ToastSampleIconComponent,
    ToastBodyComponent],
  templateUrl: './toast-error.html',
  styleUrl: './toast-error.css'
})
export class ToastError implements OnInit {

  // L'Input recevra maintenant l'objet { error: string, success: string }
  @Input() currentNotification: Signal<{ error: string, success: string } | undefined> = signal(undefined);

  position = 'top-end';
  visible = signal(false);
  percentage = signal(0);

  // Computed pour déterminer si un message (erreur ou succès) est présent
  hasMessage = computed(() => {
    const notification = this.currentNotification();
    return !!notification && (notification.error.length > 0 || notification.success.length > 0);
  });

  // Computed pour le titre du toast
  toastTitle = computed(() => {
    const notification = this.currentNotification();
    if (notification?.error.length) {
      return 'Something went wrong';
    } else if (notification?.success.length) {
      return 'Succès';
    }
    return 'Notification'; // Titre par défaut si aucun message spécifique
  });

  // Computed pour le détail/corps du toast
  toastDetail = computed(() => {
    const notification = this.currentNotification();
    if (notification?.error.length) {
      return notification.error;
    } else if (notification?.success.length) {
      return notification.success;
    }
    return 'Aucune information.';
  });

  // Computed pour déterminer le type de message (pour l'icône ou le style)
  messageType = computed(() => {
    const notification = this.currentNotification();
    if (notification?.error.length) {
      return 'error';
    } else if (notification?.success.length) {
      return 'success';
    }
    return 'info'; // Ou un type par défaut
  });

  ngOnInit(): void {
    if (this.hasMessage()) {
      this.visible.set(true);

    }
  }

  // Computed final pour contrôler la visibilité du toast
  // Le toast est visible si notre signal `visible` est vrai ET si `hasMessage` est vrai
  showToast = computed(() => this.visible() && this.hasMessage());


  // Méthode pour ouvrir/fermer le toast
  toggleToast() {
    this.visible.update((value) => !value);
  }

  onVisibleChange($event: boolean) {
    this.visible.set($event);
    this.percentage.set(this.visible() ? this.percentage() : 0);
  }

  onTimerChange($event: number) {
    this.percentage.set($event * 25);
  }
}
