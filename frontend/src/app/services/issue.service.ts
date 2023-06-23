import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class IssueService {
    private readonly API_URL = environment.API_URL + '/issue';

    constructor(private httpClient: HttpClient) {}

    getOne(id: string) {
        return this.httpClient.get(this.API_URL + '/' + id);
    }

    getAll(featureId: string, filters: any = {}, pagination: any = {}) {
        filters    = JSON.stringify(filters);
        pagination = JSON.stringify(pagination);

        return this.httpClient.get(`${this.API_URL}?feature_id=${featureId}&filters=${filters}&pagination=${pagination}`);
    }

    create(data: any) {
        return this.httpClient.post(this.API_URL, data);
    }

    update(id: string, data: any) {
        return this.httpClient.put(this.API_URL + '/' + id, data);
    }

    delete(id: string) {
        return this.httpClient.delete(this.API_URL + '/' + id);
    }
}
