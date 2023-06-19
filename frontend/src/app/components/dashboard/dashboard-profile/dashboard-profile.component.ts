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

    constructor() {}

    ngOnInit() {
        const firstName = this.user?.first_name || '';
        const lastName  = this.user.last_name   || '';

        this.name = firstName + ' ' + lastName;
        this.picture = this.user?.picture_url || '';
    }
}
