import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-nav',
  templateUrl: './dashboard-nav.component.html',
  styleUrls: ['./dashboard-nav.component.css']
})
export class DashboardNavComponent {
    @Input() user: any;
    isAdmin: boolean = false;

    constructor() {}

    ngOnInit() {
        this.isAdmin = this.user?.role == 'ADMIN';
    }
}
