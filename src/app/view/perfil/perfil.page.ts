import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/common/alert.service';
import { AuthService } from 'src/app/model/service/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  perfilForm: FormGroup;
  usuario: any;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private authService: AuthService
  ) {
    this.perfilForm = this.formBuilder.group({
      nome: ['', Validators.required],
      idade: [null, [Validators.min(1), Validators.max(120)]],
      sexo: [''],
      altura: [null, [Validators.min(0.5), Validators.max(2.5)]],
      peso: [null, [Validators.min(1), Validators.max(400)]],
    });
  }

  ngOnInit() {
    this.carregarDados();
  }

  ionViewWillEnter() {
    this.carregarDados();
  }

  carregarDados() {
    this.usuario = this.authService.getUserLogged();
    if (this.usuario) {
      this.perfilForm.patchValue({
        nome: this.usuario.nome || '',
        idade: this.usuario.idade || null,
        sexo: this.usuario.sexo || '',
        altura: this.usuario.altura || null,
        peso: this.usuario.peso || null,
      });
    }
  }

  get errorControl() {
    return this.perfilForm.controls;
  }

  get imc(): string | null {
    const altura = this.perfilForm.value.altura;
    const peso = this.perfilForm.value.peso;
    if (!altura || !peso) {
      return null;
    }
    const imc = peso / (altura * altura);
    return imc.toFixed(1);
  }

  get classificacaoImc(): string {
    const valor = this.imc ? parseFloat(this.imc) : null;
    if (valor === null) {
      return '';
    }
    if (valor < 18.5) return 'Abaixo do peso';
    if (valor < 25) return 'Peso normal';
    if (valor < 30) return 'Sobrepeso';
    if (valor < 35) return 'Obesidade grau I';
    if (valor < 40) return 'Obesidade grau II';
    return 'Obesidade grau III';
  }

  async salvar() {
    if (this.perfilForm.invalid) {
      this.alertService.presentAlert(
        'Erro',
        'Verifique os campos preenchidos.'
      );
      return;
    }

    await this.alertService.simpleLoader();
    try {
      await this.authService.updateProfile(this.perfilForm.value);
      this.alertService.dismissLoader();
      this.alertService.presentAlert('Sucesso', 'Perfil atualizado!');
      this.carregarDados();
    } catch (error: any) {
      this.alertService.dismissLoader();
      this.alertService.presentAlert(
        'Erro',
        error.message || 'Não foi possível salvar seus dados.'
      );
    }
  }
}