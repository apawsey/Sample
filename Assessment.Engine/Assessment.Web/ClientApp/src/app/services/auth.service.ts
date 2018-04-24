




import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import * as auth0 from 'auth0-js';

import { LocalStoreManager } from './local-store-manager.service';
import { EndpointFactory } from './endpoint-factory.service';
import { ConfigurationService } from './configuration.service';
import { DBkeys } from './db-Keys';
import { JwtHelper } from './jwt-helper';
import { Utilities } from './utilities';
import { User } from '../models/user.model';

@Injectable()
export class AuthService {

    public get loginUrl() { return this.configurations.loginUrl; }
    public get homeUrl() { return this.configurations.homeUrl; }

    public loginRedirectUrl: string;
    public logoutRedirectUrl: string;

    public reLoginDelegate: () => void;

    private previousIsLoggedInCheck = false;
    private _loginStatus = new Subject<boolean>();

    auth0 = new auth0.WebAuth({
        clientID: 'kINf4j2g3D5LRSpkb0RAFXdLFXDGerrE',
        domain: 'assessmentweb.auth0.com',
        responseType: 'token id_token',
        audience: 'https://assessmentweb.auth0.com/userinfo',
        scope: 'openid profile email'
    });

    constructor(private router: Router, private configurations: ConfigurationService, private endpointFactory: EndpointFactory, private localStorage: LocalStoreManager) {
        this.initializeLoginStatus();
    }


    private initializeLoginStatus() {
        this.localStorage.getInitEvent().subscribe(() => {
            this.reevaluateLoginStatus();
        });
    }


    gotoPage(page: string, preserveParams = true) {

        let navigationExtras: NavigationExtras = {
            queryParamsHandling: preserveParams ? "merge" : "", preserveFragment: preserveParams
        };


        this.router.navigate([page], navigationExtras);
    }


    redirectLoginUser() {
        let redirect = this.loginRedirectUrl && this.loginRedirectUrl != '/' && this.loginRedirectUrl != ConfigurationService.defaultHomeUrl ? this.loginRedirectUrl : this.homeUrl;
        this.loginRedirectUrl = null;


        let urlParamsAndFragment = Utilities.splitInTwo(redirect, '#');
        let urlAndParams = Utilities.splitInTwo(urlParamsAndFragment.firstPart, '?');

        let navigationExtras: NavigationExtras = {
            fragment: urlParamsAndFragment.secondPart,
            queryParams: Utilities.getQueryParamsFromString(urlAndParams.secondPart),
            queryParamsHandling: "merge"
        };
        
        this.router.navigate([urlAndParams.firstPart], navigationExtras);
    }


    redirectLogoutUser() {
        let redirect = this.logoutRedirectUrl ? this.logoutRedirectUrl : this.loginUrl;
        this.logoutRedirectUrl = null;

        this.router.navigate([redirect]);
    }


    redirectForLogin() {
        this.loginRedirectUrl = this.router.url;
        this.router.navigate([this.loginUrl]);
    }


    reLogin() {

        this.localStorage.deleteData(DBkeys.TOKEN_EXPIRES_IN);

        if (this.reLoginDelegate) {
            this.reLoginDelegate();
        }
        else {
            this.redirectForLogin();
        }
    }

    processLoginResponse(authResult: any) {
        this.auth0.client.userInfo(authResult.accessToken, (error, profile) => {
            if (error) {
                // Handle error
                return;
            }

            let accessToken = authResult.accessToken;
            if (accessToken == null)
                throw new Error("Received accessToken was empty");

            let idToken = authResult.idToken;
            //let refreshToken = response.refresh_token || this.refreshToken;
            let expiresIn = authResult.expiresIn;

            let tokenExpiryDate = new Date();
            tokenExpiryDate.setSeconds(tokenExpiryDate.getSeconds() + expiresIn);

            let accessTokenExpiry = tokenExpiryDate;

            let user = new User(
                profile.sub,
                profile.name,
                profile.email,
                profile.picture);
            user.isEnabled = true;

            this.saveUserDetails(user, accessToken, idToken, accessTokenExpiry);

            this.reevaluateLoginStatus(user);
        });
    }


    private saveUserDetails(user: User, accessToken: string, idToken: string, expiresIn: Date) {

        this.localStorage.saveSyncedSessionData(accessToken, DBkeys.ACCESS_TOKEN);
        this.localStorage.saveSyncedSessionData(idToken, DBkeys.ID_TOKEN);
        this.localStorage.saveSyncedSessionData(expiresIn, DBkeys.TOKEN_EXPIRES_IN);
        this.localStorage.saveSyncedSessionData(user, DBkeys.CURRENT_USER);
    }



    logout(): void {
        this.localStorage.deleteData(DBkeys.ACCESS_TOKEN);
        this.localStorage.deleteData(DBkeys.ID_TOKEN);
        this.localStorage.deleteData(DBkeys.TOKEN_EXPIRES_IN);
        this.localStorage.deleteData(DBkeys.CURRENT_USER);

        this.configurations.clearLocalChanges();

        this.reevaluateLoginStatus();
    }


    private reevaluateLoginStatus(currentUser?: User) {

        let user = currentUser || this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        let isLoggedIn = user != null;

        if (this.previousIsLoggedInCheck != isLoggedIn) {
            setTimeout(() => {
                this._loginStatus.next(isLoggedIn);
            });
        }

        this.previousIsLoggedInCheck = isLoggedIn;
    }


    getLoginStatusEvent(): Observable<boolean> {
        return this._loginStatus.asObservable();
    }


    get currentUser(): User {

        let user = this.localStorage.getDataObject<User>(DBkeys.CURRENT_USER);
        this.reevaluateLoginStatus(user);

        return user;
    }

    get accessToken(): string {

        this.reevaluateLoginStatus();
        return this.localStorage.getData(DBkeys.ACCESS_TOKEN);
    }

    get accessTokenExpiryDate(): Date {

        this.reevaluateLoginStatus();
        return this.localStorage.getDataObject<Date>(DBkeys.TOKEN_EXPIRES_IN, true);
    }

    get isSessionExpired(): boolean {

        if (this.accessTokenExpiryDate == null) {
            return true;
        }

        return !(this.accessTokenExpiryDate.valueOf() > new Date().valueOf());
    }


    get idToken(): string {

        this.reevaluateLoginStatus();
        return this.localStorage.getData(DBkeys.ID_TOKEN);
    }

    get isLoggedIn(): boolean {
        return this.currentUser != null;
    }
}
