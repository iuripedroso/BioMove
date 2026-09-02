import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  BodyCompositionTestConfig,
  BodyCompositionTestField,
  BodyCompositionTestResultRow,
} from 'src/app/model/body-composition-test.model';
import { BodyCompositionTestsService } from 'src/app/model/service/body-composition-tests.service';
import { AlertService } from 'src/app/common/alert.service';
import { RecentTestsService } from 'src/app/model/service/recent-tests.service';

@Component({
  selector: 'app-body-composition-detail',
  templateUrl: './body-composition-detail.page.html',
  styleUrls: ['./body-composition-detail.page.scss'],
})
export class BodyCompositionDetailPage implements OnInit {
  test?: BodyCompositionTestConfig;
  form: FormGroup = this.formBuilder.group({});
  resultRows: BodyCompositionTestResultRow[] | null = null;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private bodyCompositionTestsService: BodyCompositionTestsService,
    private alertService: AlertService,
    private recentTestsService: RecentTestsService
  ) {}

  ngOnInit() {
    const testId = this.route.snapshot.paramMap.get('id') ?? '';
    this.test = this.bodyCompositionTestsService.getTests().find((t) => t.id === testId);

    if (!this.test) {
      this.alertService.presentAlert('Erro', 'Teste não encontrado.');
      return;
    }

    this.buildForm(this.test);

    // registra a visita para o atalho "continuar" da home
    this.recentTestsService.record({
      categoryId: 'body-composition',
      testId: this.test.id,
      code: this.test.code,
      name: this.test.name,
    });
  }

  /** Monta o FormGroup dinamicamente a partir dos campos do teste. */
  private buildForm(test: BodyCompositionTestConfig) {
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

  /** Retorna o FormArray de um campo repetido. */
  repeatControls(field: BodyCompositionTestField): FormArray {
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

    const result = this.bodyCompositionTestsService.calculate(this.test.id, this.form.value);
    this.resultRows = result.rows;
  }
}
