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
    isPassVisible: boolean = false;
    
    form: FormGroup = this.formBuilder.group({
        picture_id  : [null],
        picture_url : ['https://www.shutterstock.com/image-vector/gray-photo-placeholder-icon-design-260nw-1898064247.jpg'],
        email       : ['', [Validators.required, Validators.email]],
        first_name  : ['', Validators.required],
        last_name   : ['', Validators.required],
        password    : ['', [Validators.required, Validators.minLength(6)]],
        role        : ['', Validators.required],
        feature_ids : [[]]
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
    isUploadPicture: boolean = false;
    isDeletePicture: boolean = false;
    isPictureChange: boolean = false;
    selectedPictureFile: File | null = null;
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

            if (this.selectedRoleIsAdmin) {
                this.form.get('feature_ids')?.setValue([]);
            }
        }));

        this.fetchAllFeatures();
    }

    onPictureChange(event: any) {
        this.isPictureChange = true;
        this.isUploadPicture = event.isUpload;
        this.isDeletePicture = event.isDelete;
        
        if (event.isUpload) {
            this.selectedPictureFile = event.file;
        }
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
        if (this.form.invalid) {
            Object.entries(this.form.controls).forEach(([_, control]) => {
                control.markAllAsTouched();
            });

            return this.form.updateValueAndValidity();
        }

        if (this.data.edit) {
            const prevFormData = JSON.stringify(this.prevFormData);
            const currFormData = JSON.stringify(this.form.value);
            
            if ((prevFormData == currFormData) && !this.isPictureChange) {
                return this.matSnackBar.open('You haven\'t updated anything');
            }
        }

        const value = this.form.value;
        const data  = this.data;

        const extras = {
            picture_file: this.selectedPictureFile || null,
            is_delete_picture: this.isDeletePicture,
            is_upload_picture: this.isUploadPicture
        };

        this.isEdit ? this.updateUser(data.user._id, value, extras) : this.createUser(value, extras);
    }

    createUser(data: any, extras: any) {
        this.isLoading = true;

        this.subs.add(this.userService.create(data, extras).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.matSnackBar.open(data?.detail || '');
                this.dialog.close(true);
            },
            error: (error) => {
                this.isLoading = false;
                this.matSnackBar.open(JSON.stringify(error.error.detail) || error.message);
            }
        }))
    }

    updateUser(id: string, data: any, extras: any) {
        this.isLoading = true;

        this.subs.add(this.userService.update(id, data, extras).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.matSnackBar.open(data?.detail || '');
                this.dialog.close(true);
            },
            error: (error) => {
                this.isLoading = false;
                this.matSnackBar.open(JSON.stringify(error?.error?.detail) || error.message);
            }
        }))
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
