import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ImagekitService } from './imagekit.service';
import { mergeMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly API_URL = environment.API_URL + '/user';

    constructor(
        private httpClient: HttpClient,
        private imageKitService: ImagekitService
    ) { }

    getOne(id: string) {
        return this.httpClient.get(this.API_URL + '/' + id);
    }

    getAll(filters: any = {}, pagination: any = {}, sort: any = {}) {
        filters = JSON.stringify(filters);
        pagination = JSON.stringify(pagination);
        sort = JSON.stringify(sort);

        const url = `${this.API_URL}?filters=${filters}&pagination=${pagination}&sort=${sort}`;
        return this.httpClient.get(url);
    }

    create(data: any, extras: any) {
        const url = this.API_URL;

        if (extras?.picture_file) {
            const file = extras.picture_file;

            return this.imageKitService.upload(file).pipe(
                mergeMap((resp: any) => {
                    data.picture_id  = resp.fileId;
                    data.picture_url = resp.url;
                    return this.httpClient.post(url, data)
                })
            );
        }

        return this.httpClient.post(url, data);
    }

    update(id: string, data: any, extras: any) {
        const url = this.API_URL + '/' + id;

        if (extras?.is_delete_picture) {
            const fileId = data.picture_id;

            return this.imageKitService.delete(fileId).pipe(
                mergeMap((resp: any) => {
                    data.picture_id  = '';
                    data.picture_url = 'https://www.shutterstock.com/image-vector/gray-photo-placeholder-icon-design-260nw-1898064247.jpg';
                    return this.httpClient.put(url, data);
                })
            );
        }

        if (extras?.is_upload_picture) {
            const file = extras.picture_file;
            
            if (data?.picture_id) {
                const fileId = data.picture_id;

                // hapus foto yang lama sebelum upload yang baru.
                return this.imageKitService.delete(fileId).pipe(
                    mergeMap(() => this.imageKitService.upload(file)),
                    mergeMap((resp: any) => {
                        data.picture_id  = resp.fileId;
                        data.picture_url = resp.url;
                        return this.httpClient.put(url, data)
                    })
                );
            }

            return this.imageKitService.upload(file).pipe(
                mergeMap((resp: any) => {
                    data.picture_id  = resp.fileId;
                    data.picture_url = resp.url;
                    return this.httpClient.put(url, data)
                })
            );
        }

        return this.httpClient.put(url, data);
    }

    delete(id: string) {
        const url = this.API_URL + '/' + id;
        return this.httpClient.delete(url);
    }
}
