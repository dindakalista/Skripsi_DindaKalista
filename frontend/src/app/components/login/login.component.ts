import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    subs = new Subscription();
    isLoading: boolean = false;
    isPassVisible: boolean = false;

    form: FormGroup = this.formBuilder.group({
        email   : [null, [Validators.required, Validators.email]],
        password: [null, Validators.required]
    });

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private matSnackbar: MatSnackBar,
        private router: Router
    ) {}

    onSubmit() {
        if (this.form.invalid) {
            return this.form.updateValueAndValidity();
        }

        this.isLoading = true;

        const { email, password } = this.form.value;
        const sub = this.authService.login(email, password).subscribe({
            next: () => {
                this.isLoading = false;
                this.router.navigate(['']);
            },
            error: (error) => {
                this.isLoading = false;
                this.matSnackbar.open(error?.error?.detail || error.message)
            }
        });
        
        this.subs.add(sub);
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
