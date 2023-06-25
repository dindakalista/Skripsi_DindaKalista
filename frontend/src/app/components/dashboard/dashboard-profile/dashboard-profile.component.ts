import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-dashboard-profile',
    templateUrl: './dashboard-profile.component.html',
    styleUrls: ['./dashboard-profile.component.css']
})
export class DashboardProfileComponent {
    @Input() user: any;
    @Output() logout = new EventEmitter();

    name: string = '';
    picture: string = '';

    roles: any = {
        'ADMIN': 'Admin',
        'FE': 'Frontend',
        'BE': 'Backend',
        'QA': 'Quality Assurance'
    };

    constructor() { }

    ngOnInit() {
        const firstName = this.user?.first_name || '';
        const lastName = this.user?.last_name || '';
        const role = this.user?.role || '';

        this.name = firstName + ' ' + lastName + ' (' + this.roles[role] + ')';
        this.picture = this.user?.picture_url || '';
    }
}
