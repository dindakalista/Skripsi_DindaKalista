import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { FeatureService } from 'src/app/services/feature.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileDialogComponent } from './profile-dialog/profile-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
    subs = new Subscription();

    user: any = {};
    features: any = [];
    
    isLoading: boolean = false;
    prevFormData: any = {};

    roles = [
        { value: 'ADMIN', key: 'Admin' },
        { value: 'FE',    key: 'Front End' },
        { value: 'BE',    key: 'Back End' },
        { value: 'QA',    key: 'Quality Assurance' },
    ];

    form: FormGroup = this.formBuilder.group({
        email       : [null, Validators.required],
        first_name  : [null, Validators.required],
        last_name   : [null, Validators.required],
        role        : [null, Validators.required],
        feature_ids : [[]],
    });

    constructor(
        private userService: UserService,
        private authService: AuthService,
        private featureService: FeatureService,
        private matSnackbar: MatSnackBar,
        private matDialog: MatDialog,
        private formBuilder: FormBuilder
    ) {}

    ngOnInit() {
        this.fetchUser();
        this.fetchAllFeatures();
    }

    openDialog() {
        const dialogRef = this.matDialog.open(ProfileDialogComponent, {
            disableClose: true
        });

        this.subs.add(dialogRef.afterClosed().subscribe((data: any) => {
            if (!data) return;
            this.fetchUser();
        }));
    }

    onPictureChange(event: any) {
        if (event.success) {
            this.matSnackbar.open('Profile photo updated');
        } else {
            this.matSnackbar.open(JSON.stringify(event.error?.error?.detail) || event.error.message);
        }
    }

    onSave() {
        if (this.form.invalid) {
            return this.form.updateValueAndValidity();
        }

        this.updateUser();
    }

    fetchUser() {
        this.isLoading = true;

        const id  = this.authService.getData()?.user?._id || '';
        const sub = this.userService.getOne(id).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.user = data;
                this.form.patchValue(data);
                this.prevFormData = this.form.value;
            },
            error: (error) => {
                this.isLoading = false;
                this.matSnackbar.open(JSON.stringify(error?.error?.detail) || error.message);
            }
        });

        this.subs.add(sub);
    }

    fetchAllFeatures() {
        this.isLoading = true;

        const sub = this.featureService.getAll().subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.features = data.features;
            },
            error: (error) => {
                this.isLoading = false;
                this.matSnackbar.open(JSON.stringify(error?.error?.detail) || error.message);
            }
        });

        this.subs.add(sub);
    }

    isFormUpdated() {
        const prevFormData = JSON.stringify(this.prevFormData);
        const currFormData = JSON.stringify(this.form.value);

        return prevFormData != currFormData;
    }

    updateUser(): any {
        if (!this.isFormUpdated()) {
            return this.matSnackbar.open('You haven\'t updated anything');
        }

        this.isLoading = true;

        const id  = this.authService.getData()?.user?._id || '';
        const data = this.form.value;

        const sub = this.userService.update(id, data).subscribe({
            next: (data: any) => {
                this.isLoading = false;
                this.matSnackbar.open(data.detail);
            },
            error: (error) => {
                this.isLoading = false;
                this.matSnackbar.open(JSON.stringify(error?.error?.detail) || error.message);
            }
        });

        this.subs.add(sub);
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
