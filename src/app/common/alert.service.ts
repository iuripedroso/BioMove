import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private loadingEl: HTMLIonLoadingElement | null = null;

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async presentAlert(subHeader: string, message: string) {
    const alert = await this.alertController.create({
      header: 'PerformaVolei',
      subHeader: subHeader,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async simpleLoader() {
    this.loadingEl = await this.loadingController.create({
      message: 'Aguarde...',
    });
    await this.loadingEl.present();
  }

  async dismissLoader() {
    if (this.loadingEl) {
      await this.loadingEl.dismiss();
      this.loadingEl = null;
    }
  }
}