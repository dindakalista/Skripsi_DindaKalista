import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { FeatureService } from 'src/app/services/feature.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-user-dialog',
    templateUrl: './user-dialog.component.html',
    styleUrls: ['./user-dialog.component.css']
})
export class UserDialogComponent {
    subs = new Subscription();
    
    form: FormGroup = this.formBuilder.group({
        email       : ['', [Validators.required, Validators.email]],
        first_name  : ['', Validators.required],
        last_name   : ['', Validators.required],
        password    : ['', [Validators.required, Validators.minLength(6)]],
        role        : ['', Validators.required],
        feature_ids : [[]],
    });

    roles = [
        { value: 'ADMIN', key: 'Admin' },
        { value: 'FE',    key: 'Front End' },
        { value: 'BE',    key: 'Back End' },
        { value: 'QA',    key: 'Quality Assurance' },
    ];

    features: any[] = [];

    isEdit: boolean = false;
    isLoading: boolean = false;
    isPictureChange: boolean = false;
    selectedRoleIsAdmin: boolean = false;
    prevFormData: any = {};

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialogRef<UserDialogComponent>,
        private formBuilder: FormBuilder,
        private matSnackBar: MatSnackBar,
        private userService: UserService,
        private featureService: FeatureService
    ) { }

    ngOnInit() {
        this.isEdit = this.data.edit;

        if (this.isEdit) {
            this.form.patchValue(this.data.user);
            this.form.get('password')?.removeValidators(Validators.required);
            this.prevFormData = this.form.value;
        }

        this.subs.add(this.form.get('role')?.valueChanges.subscribe(value => {
            this.selectedRoleIsAdmin = value == 'ADMIN';
            this.form.get('feature_ids')?.[this.selectedRoleIsAdmin ? 'disable' : 'enable']();
        }));

        this.fetchAllFeatures();
    }

    onPictureChange() {
        this.isPictureChange = true;
    }

    fetchAllFeatures() {
        this.isLoading = true;

        this.subs.add(this.featureService.getAll().subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.features = data.features;
            },
            error: error => {
                this.isLoading = false;
                this.matSnackBar.open(JSON.stringify(error?.error?.detail) || error.message);
            }
        }))
    }

    submit() {
        if (this.data.edit) {
            const prevFormData = JSON.stringify(this.prevFormData);
            const currFormData = JSON.stringify(this.form.value);
            
            if ((prevFormData == currFormData) && this.isPictureChange) {
                return this.dialog.close(true);
            }
        }

        if (this.form.invalid) {
            return this.form.updateValueAndValidity();
        }

        const value = this.form.value;
        const data  = this.data;

        this.isEdit ? this.updateUser(data.user._id, value) : this.createUser(value);
    }

    createUser(data: any) {
        this.isLoading = true;

        this.subs.add(this.userService.create(data).subscribe({
            next: () => {
                this.isLoading = false;
                this.dialog.close(true);
            },
            error: (error) => {
                this.isLoading = false;
                this.matSnackBar.open(JSON.stringify(error.error.detail) || error.message);
            }
        }))
    }

    updateUser(id: string, data: any) {
        this.isLoading = true;

        this.subs.add(this.userService.update(id, data).subscribe({
            next: () => {
                this.isLoading = false;
                this.dialog.close(true);
            },
            error: (error) => {
                this.isLoading = false;
                this.matSnackBar.open(JSON.stringify(error.error.detail) || error.message);
            }
        }))
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
