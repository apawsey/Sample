import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

import { AccountEndpoint } from './account-endpoint.service';
import { AuthService } from './auth.service';

@Injectable()
export class AccountService {

    constructor(private router: Router, private http: HttpClient, private authService: AuthService) {

    }

    get currentUser() {
        return this.authService.currentUser;
    }
}
