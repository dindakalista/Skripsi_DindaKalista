import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    subs = new Subscription();
    isLoggedIn: boolean = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit() {
        const sub1 = this.authService.stateChange.subscribe((state: boolean | null) => {
            if (state == null) return;

            // update state
            this.isLoggedIn = state;

            if (this.isLoggedIn) {
                this.router.navigate(['']);
            }

            // kalo state false berarti user logout
            // jadi perlu redirect ke halaman login
            if (!this.isLoggedIn) {
                this.router.navigate(['/login']);
            }
        });

        const sub2 = this.authService.verify().subscribe();

        this.subs.add(sub1);
        this.subs.add(sub2);
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
