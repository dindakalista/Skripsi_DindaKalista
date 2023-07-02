import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { FeatureService } from 'src/app/services/feature.service';

@Component({
  selector: 'app-feature-dialog',
  templateUrl: './feature-dialog.component.html',
  styleUrls: ['./feature-dialog.component.css']
})
export class FeatureDialogComponent {
    subs = new Subscription();
    
    form: FormGroup = this.formBuilder.group({
        name: ['', Validators.required]
    });

    isEdit: boolean = false;
    isLoading: boolean = false;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialog: MatDialogRef<FeatureDialogComponent>,
        private formBuilder: FormBuilder,
        private matSnackBar: MatSnackBar,
        private featureService: FeatureService,
    ) { }

    ngOnInit() {
        this.isEdit = this.data.edit;
        this.form.patchValue(this.data.feature);
    }

    submit() {
        if (this.form.invalid) {
            return this.form.updateValueAndValidity();
        }

        const value = this.form.value;
        const data  = this.data;

        this.isEdit ? this.updateFeature(data.feature._id, value) : this.createFeature(value);
    }

    createFeature(data: any) {
        this.isLoading = true;

        const sub = this.featureService.create(data).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.matSnackBar.open(data?.detail || '');
                this.dialog.close(true);
            },
            error: (error) => {
                this.isLoading = false;
                this.matSnackBar.open(error?.error?.detail || error.message);
            }
        });

        this.subs.add(sub);
    }

    updateFeature(id: string, data: any) {
        this.isLoading = true;

        const sub = this.featureService.update(id, data).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.matSnackBar.open(data?.detail || '');
                this.dialog.close(true);
            },
            error: (error) => {
                this.isLoading = false;
                this.matSnackBar.open(error?.error?.detail || error.message);
            }
        });

        this.subs.add(sub);
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
