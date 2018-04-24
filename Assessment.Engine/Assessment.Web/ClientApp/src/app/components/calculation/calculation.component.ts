import { Component, OnInit } from '@angular/core';
import { AppTranslationService } from "../../services/app-translation.service";
import { SignalRService } from "../../services/signal-r.service";
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalculationItem } from "../../models/calculation-item.model";

@Component({
  selector: 'app-calculation',
  templateUrl: './calculation.component.html',
  styleUrls: ['./calculation.component.css']
})
export class CalculationComponent implements OnInit {

    calculateForm = this.formBuilder.group({
        serverAddress: ['', Validators.required],
        calculationItems: this.formBuilder.array([])
    });
    form = this.calculateForm;

    connected = false;

    constructor(private translationService: AppTranslationService, private formBuilder: FormBuilder, private signalRservice: SignalRService ) { }

    ngOnInit() {
        this.calculateForm.patchValue({
            'serverAddress': window.location.protocol + '//' + window.location.host,
        });
    }

    get calculationItems(): FormArray {
        return this.calculateForm.get('calculationItems') as FormArray;
    };

    addCalculationItem(): void {
        this.calculationItems.push(this.formBuilder.group(new CalculationItem()));
    }
    removeCalculationItem(index:number): void {
        this.calculationItems.removeAt(index);
    }

    connect(): void {
        this.signalRservice.connect(this.calculateForm.get('serverAddress').value + '/calculationHub').subscribe((result: string) => {
            this.connected = result !== '';
            this.addCalculationItem();
        });
    }

    calculate(): void {
        this.signalRservice.sendCalculations(this.calculationItems.value).subscribe(result => {
            this.calculationItems.patchValue(result);
        });
    }

    disconnect(): void {
        this.signalRservice.disconnect().subscribe((result: boolean) => {
            this.connected = false;
            this.calculateForm.setControl('calculationItems', this.formBuilder.array([]));
        });
    }
}
