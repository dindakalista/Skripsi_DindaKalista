import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
    user: any;

    constructor(
        private authService: AuthService
    ) { }

    ngOnInit() {
        const { user } = this.authService.getData();
        this.user = user;
    }

    onLogout() {
        this.authService.logout();
    }
}
