import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API_URL   = environment.API_URL + '/auth';
    private readonly TOKEN_KEY = environment.TOKEN_KEY;
    private readonly USER_KEY  = environment.USER_KEY;

    private stateChangeSource = new BehaviorSubject<boolean | null>(null);
    stateChange = this.stateChangeSource.asObservable();

    constructor(private httpClient: HttpClient) { }

    login(email: string, password: string) {
        return this.httpClient.post(this.API_URL + '/login', { email, password }).pipe(
            tap((data: any) => {
                this.setData(data);
                this.setState(true);
            })
        );
    }

    logout() {
        this.clearData();
        this.setState(false);
    }

    verify() {
        const token = this.getData().token || '';
        const headers = { 'Authorization': token };

        return this.httpClient.post(this.API_URL + '/verify', {}, { headers }).pipe(
            tap((data: any) => {
                this.setData(data);
                this.setState(true);
            }),
            catchError((error) => {
                if (error.status == 401) this.clearData();
                this.setState(false);
                return throwError(() => error);
            })
        );
    }

    changePassword(id: string, old_password: string, new_password: string) {
        const data = { id, old_password, new_password };
        return this.httpClient.post(this.API_URL + '/change-password', data);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    setState(state: boolean) {
        this.stateChangeSource.next(state);
    }

    setData(data: any) {
        const { token, user } = data;

        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    
    getData() {
        const user = localStorage.getItem(this.USER_KEY) || 'null';
        const token = localStorage.getItem(this.TOKEN_KEY);

        return { token, user: JSON.parse(user) };
    }

    clearData() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }
}
