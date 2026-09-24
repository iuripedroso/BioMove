import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/common/alert.service';
import { AuthService } from 'src/app/model/service/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  signupForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private authService: AuthService
  ) {
    this.signupForm = this.formBuilder.group(
      {
        nome: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        instituicao: ['', Validators.required],
        senha: ['', [Validators.required, Validators.minLength(6)]],
        confSenha: ['', [Validators.required, Validators.minLength(6)]],
      },
      {
        validators: this.checkPasswords,
      }
    );
  }

  ngOnInit() {}

  get errorControl() {
    return this.signupForm.controls;
  }

  checkPasswords(formGroup: FormGroup) {
    const senha = formGroup.get('senha')?.value;
    const confSenha = formGroup.get('confSenha')?.value;
    return senha === confSenha ? null : { notSame: true };
  }

  async submitForm() {
    if (this.signupForm.valid) {
      this.alertService.simpleLoader();

      try {
        await this.authService.signUpWithEmailPassword(
          this.signupForm.value.email,
          this.signupForm.value.senha,
          {
            nome: this.signupForm.value.nome,
            instituicao: this.signupForm.value.instituicao,
          }
        );

        this.alertService.dismissLoader();
        this.alertService.presentAlert(
          'Sucesso',
          'Cadastro realizado com sucesso!'
        );
        this.router.navigate(['sign-in']);
      } catch (error: any) {
        this.alertService.dismissLoader();
        this.alertService.presentAlert(
          'Erro',
          error.message ||
            'Ocorreu um erro ao cadastrar. Tente novamente mais tarde.'
        );
      }
    } else {
      this.alertService.presentAlert(
        'Erro',
        'Preencha todos os campos corretamente.'
      );
    }
  }
}
