import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { IssueComponent } from './components/issue/issue.component';
import { IssueDialogComponent } from './components/issue/issue-dialog/issue-dialog.component';
import { FeatureComponent } from './components/feature/feature.component';
import { FeatureDialogComponent } from './components/feature/feature-dialog/feature-dialog.component';
import { UserComponent } from './components/user/user.component';
import { UserDialogComponent } from './components/user/user-dialog/user-dialog.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProfileDialogComponent } from './components/profile/profile-dialog/profile-dialog.component';
import { DashboardNavComponent } from './components/dashboard/dashboard-nav/dashboard-nav.component';
import { DashboardProfileComponent } from './components/dashboard/dashboard-profile/dashboard-profile.component';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        DashboardComponent,
        IssueComponent,
        IssueDialogComponent,
        FeatureComponent,
        FeatureDialogComponent,
        UserComponent,
        UserDialogComponent,
        ProfileComponent,
        ProfileDialogComponent,
        DashboardNavComponent,
        DashboardProfileComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        SharedModule,
        BrowserAnimationsModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
          }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
