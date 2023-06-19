import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ImagekitService {
    private readonly API_URL: any = environment.API_URL + '/imagekit';

    constructor(private httpClient: HttpClient) { }

    upload(file: File) {
        const formData: FormData = new FormData();
        
        formData.append('file', file);
        formData.append('fileName', file.name);
        
        return this.httpClient.post(this.API_URL, formData)
    }

    delete(fileId: string) {
        return this.httpClient.delete(this.API_URL + '/' + fileId)
    }
}
