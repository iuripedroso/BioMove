import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  EnduranceTestConfig,
  EnduranceTestField,
  EnduranceTestResultRow,
} from 'src/app/model/endurance-test.model';
import { EnduranceTestsService } from 'src/app/model/service/endurance-tests.service';
import { AlertService } from 'src/app/common/alert.service';
import { RecentTestsService } from 'src/app/model/service/recent-tests.service';

@Component({
  selector: 'app-endurance-detail',
  templateUrl: './endurance-detail.page.html',
  styleUrls: ['./endurance-detail.page.scss'],
})
export class EnduranceDetailPage implements OnInit {
  test?: EnduranceTestConfig;
  form: FormGroup = this.formBuilder.group({});
  resultRows: EnduranceTestResultRow[] | null = null;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private enduranceTestsService: EnduranceTestsService,
    private alertService: AlertService,
    private recentTestsService: RecentTestsService
  ) {}

  ngOnInit() {
    const testId = this.route.snapshot.paramMap.get('id') ?? '';
    this.test = this.enduranceTestsService.getTests().find((t) => t.id === testId);

    if (!this.test) {
      this.alertService.presentAlert('Erro', 'Teste não encontrado.');
      return;
    }

    this.buildForm(this.test);

    // registra a visita para o atalho "continuar" da home
    this.recentTestsService.record({
      categoryId: 'endurance',
      testId: this.test.id,
      code: this.test.code,
      name: this.test.name,
    });
  }

  /** Monta o FormGroup dinamicamente a partir dos campos do teste. */
  private buildForm(test: EnduranceTestConfig) {
    const group: Record<string, any> = {};

    for (const field of test.fields) {
      if (field.repeat) {
        const controls = Array.from({ length: field.repeat }, () =>
          this.formBuilder.control(null, Validators.required)
        );
        group[field.key] = this.formBuilder.array(controls);
      } else if (field.type === 'select') {
        group[field.key] = [field.options?.[0]?.value ?? null, Validators.required];
      } else {
        group[field.key] = [null, Validators.required];
      }
    }

    this.form = this.formBuilder.group(group);
  }

  /** Retorna o FormArray de um campo repetido (ex: os 6 tempos do RAST). */
  repeatControls(field: EnduranceTestField): FormArray {
    return this.form.get(field.key) as FormArray;
  }

  get errorControl() {
    return this.form.controls;
  }

  calcular() {
    if (!this.test) {
      return;
    }
    if (this.form.invalid) {
      this.alertService.presentAlert('Erro', 'Preencha todos os campos corretamente.');
      return;
    }

    const result = this.enduranceTestsService.calculate(this.test.id, this.form.value);
    this.resultRows = result.rows;
  }
}
