import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { ImagekitService } from 'src/app/services/imagekit.service';
import { Subscription, mergeMap } from 'rxjs';

@Component({
    selector: 'app-profile-picture',
    templateUrl: './profile-picture.component.html',
    styleUrls: ['./profile-picture.component.css']
})
export class ProfilePictureComponent {
    @Input() user: any = null;
    @Input() showDeleteButton: boolean = true;
    @Input() showUploadButton: boolean = true;
    @Output() change = new EventEmitter();

    subs = new Subscription();

    defaultPictureUrl: string = 'https://www.shutterstock.com/image-vector/gray-photo-placeholder-icon-design-260nw-1898064247.jpg';
    pictureUrl: string = this.defaultPictureUrl;
    isLoading: boolean = false;
    isChanged: boolean = false;
    
    constructor(
        private userService: UserService,
        private imageKitService: ImagekitService
    ) { }

    ngOnChanges() {
        if (!this.user) return;
        this.pictureUrl = this.user.picture_url || this.defaultPictureUrl;
    }

    onUpload() {
        const input = document.createElement('input');
        
        input.type = 'file';
        input.multiple = false;
        input.accept = '.jpg, .png, .jpeg';

        input.onchange = () => {
            const file = input.files![0];

            this.pictureUrl = URL.createObjectURL(file);
            this.change.emit({ file, isUpload: true, isDelete: false })
        };

        input.click(); input.remove();
    }

    onDelete() {
        this.pictureUrl = this.defaultPictureUrl;
        this.change.emit({ isUpload: false, isDelete: true })
    }

    // onUpload() {
    //     const input = document.createElement('input');
        
    //     input.type = 'file';
    //     input.multiple = false;
    //     input.accept = '.jpg, .png, .jpeg';

    //     input.onchange = () => {
    //         const file = input.files![0];

    //         this.pictureUrl = URL.createObjectURL(file);
    //         this.isLoading = true;

    //         const userId = this.user._id;
    //         const pictureId = this.user.picture_id;

    //         let sub: any;

    //         if (pictureId) {
    //             sub = this.imageKitService.delete(pictureId).pipe(
    //                 mergeMap(() => this.imageKitService.upload(file)),
    //                 mergeMap((data: any) => this.userService.update(userId, {
    //                     picture_id : data.fileId,
    //                     picture_url: data.url
    //                 }))
    //             )
    //         }

    //         if (!pictureId) {
    //             sub = this.imageKitService.upload(file).pipe(
    //                 mergeMap((data: any) => this.userService.update(userId, {
    //                     picture_id : data.fileId,
    //                     picture_url: data.url
    //                 }))
    //             )
    //         }

    //         sub = sub.subscribe({
    //             next : () => {
    //                 this.change.emit({ success: true });
    //                 this.isLoading = false;
    //             },
    //             error: (error: any) => {
    //                 this.change.emit({ success: false, error: error });
    //                 this.isLoading = false;
    //             }
    //         });

    //         this.subs.add(sub);
    //     };

    //     input.click(); input.remove();
    // }

    // onDelete() {
    //     this.isLoading = true;
        
    //     const userId = this.user._id;
    //     const pictureId = this.user.picture_id;

    //     if (!pictureId) return;

    //     const sub = this.imageKitService.delete(pictureId).pipe(
    //         mergeMap(() => this.userService.update(userId, {
    //             picture_id : '',
    //             picture_url: ''
    //         }))
    //     ).subscribe({
    //         next : () => {
    //             this.change.emit({ success: true });
    //             this.pictureUrl = this.defaultPictureUrl;
    //             this.isLoading = false;
    //         },
    //         error: error => {
    //             this.change.emit({ success: false, error });
    //             this.isLoading = false;
    //         }
    //     });

    //     this.subs.add(sub);
    // }

    ngOnDestroy() {
        // this.subs.unsubscribe();
    }
}
