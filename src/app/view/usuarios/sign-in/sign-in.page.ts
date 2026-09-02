import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/common/alert.service';
import { AuthService } from 'src/app/model/service/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SigninPage implements OnInit {
  signinForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private authService: AuthService
  ) {
    this.signinForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {}

  get errorControl() {
    return this.signinForm.controls;
  }

  async submitForm() {
    if (this.signinForm.valid) {
      this.alertService.simpleLoader(); // Exibe o alerta de carregamento

      try {
        await this.authService.signIn(
          this.signinForm.value.email,
          this.signinForm.value.senha
        );
        this.alertService.dismissLoader(); // Fecha o alerta de carregamento
        this.alertService.presentAlert(
          'Sucesso',
          'Login realizado com sucesso!'
        ); // Alerta de sucesso
        setTimeout(() => {
          this.router.navigate(['/tabs']);
        }, 100);
      } catch (error: any) {
        this.alertService.dismissLoader(); // Fecha o alerta de carregamento
        this.alertService.presentAlert(
          'Erro',
          error.message || 'Verifique suas credenciais e tente novamente.'
        ); // Alerta de erro
      }
    }
  }

  async signInWithGoogle() {
    this.alertService.simpleLoader(); // Exibe o alerta de carregamento
    try {
      await this.authService.signInWithGoogle();
      this.alertService.dismissLoader(); // Fecha o alerta de carregamento
      this.alertService.presentAlert(
        'Sucesso',
        'Login com o Google realizado com sucesso!'
      ); // Alerta de sucesso
      setTimeout(() => {
        this.router.navigate(['/tabs']);
      }, 100);
    } catch (error: any) {
      console.log(error);
      this.alertService.dismissLoader(); // Fecha o alerta de carregamento
      this.alertService.presentAlert(
        'Erro',
        error.message || 'Ocorreu um erro ao logar com o Google.'
      ); // Alerta de erro
    }
  }

  irParaCadastro() {
    this.router.navigate(['/sign-up']);
  }
}
