import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IconsModule } from './icons.module';
import { MaterialsModule } from './materials.module';
import { ProfilePictureComponent } from './components/profile-picture/profile-picture.component';

@NgModule({
    declarations: [
        ProfilePictureComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        IconsModule,
        MaterialsModule
    ],
    exports: [
        ProfilePictureComponent,
        
        ReactiveFormsModule,
        HttpClientModule,
        IconsModule,
        MaterialsModule
    ]
})
export class SharedModule { }
