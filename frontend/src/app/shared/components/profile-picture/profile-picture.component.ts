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
    @Output() change = new EventEmitter();

    subs = new Subscription();

    defaultPictureUrl: string = 'data:image/jpeg;base64,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';
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
            this.isLoading = true;

            const userId = this.user._id;
            const pictureId = this.user.picture_id;

            let sub: any;

            if (pictureId) {
                sub = this.imageKitService.delete(pictureId).pipe(
                    mergeMap(() => this.imageKitService.upload(file)),
                    mergeMap((data: any) => this.userService.update(userId, {
                        picture_id : data.fileId,
                        picture_url: data.url
                    }))
                )
            }

            if (!pictureId) {
                sub = this.imageKitService.upload(file).pipe(
                    mergeMap((data: any) => this.userService.update(userId, {
                        picture_id : data.fileId,
                        picture_url: data.url
                    }))
                )
            }

            sub = sub.subscribe({
                next : () => {
                    this.change.emit({ success: true });
                    this.isLoading = false;
                },
                error: (error: any) => {
                    this.change.emit({ success: false, error: error });
                    this.isLoading = false;
                }
            });

            this.subs.add(sub);
        };

        input.click(); input.remove();
    }

    onDelete() {
        this.isLoading = true;
        
        const userId = this.user._id;
        const pictureId = this.user.picture_id;

        if (!pictureId) return;

        const sub = this.imageKitService.delete(pictureId).pipe(
            mergeMap(() => this.userService.update(userId, {
                picture_id : '',
                picture_url: ''
            }))
        ).subscribe({
            next : () => {
                this.change.emit({ success: true });
                this.pictureUrl = this.defaultPictureUrl;
                this.isLoading = false;
            },
            error: error => {
                this.change.emit({ success: false, error });
                this.isLoading = false;
            }
        });

        this.subs.add(sub);
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
