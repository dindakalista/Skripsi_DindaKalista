import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { IssueComponent } from './components/issue/issue.component';
import { FeatureComponent } from './components/feature/feature.component';
import { UserComponent } from './components/user/user.component';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'issue'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'issue',
        component: IssueComponent
    },
    {
        path: 'feature',
        component: FeatureComponent
    },
    {
        path: 'user',
        component: UserComponent
    },
    {
        path: 'profile',
        component: ProfileComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
