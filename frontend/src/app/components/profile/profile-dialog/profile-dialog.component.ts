import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.css']
})
export class ProfileDialogComponent {
    subs = new Subscription();
    isLoading: boolean = false;
    isOldPassVisible: boolean = false;
    isNewPassVisible: boolean = false;

    form: FormGroup = this.formBuilder.group({
        old_password: [null, Validators.required],
        new_password: [null, Validators.required]
    });

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialog: MatDialogRef<ProfileDialogComponent>,
        private formBuilder: FormBuilder,
        private matSnackBar: MatSnackBar,
        private authService: AuthService
    ) { }

    onSubmit() {
        if (!this.form.valid) {
            return this.form.updateValueAndValidity();
        }

        const id = this.authService.getData()?.user?._id || '';
        const { old_password, new_password } = this.form.value;
        
        const sub = this.authService.changePassword(id, old_password, new_password).subscribe({
            next: () => {
                this.matSnackBar.open('Password changed successfully');
                this.dialog.close(true);
            },
            error: (error) => {
                this.matSnackBar.open(JSON.stringify(error?.error?.detail) || error.message);
            }
        });

        this.subs.add(sub);
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
