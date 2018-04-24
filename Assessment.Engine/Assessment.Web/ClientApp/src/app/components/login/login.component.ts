import { Component, OnInit, OnDestroy, Input } from "@angular/core";

import { AlertService, MessageSeverity, DialogType } from '../../services/alert.service';
import { AuthService } from "../../services/auth.service";
import { ConfigurationService } from '../../services/configuration.service';
import Auth0Lock from 'auth0-lock';

@Component({
    selector: "app-login",
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {

    isLoading = false;
    formResetToggle = true;
    modalClosedCallback: () => void;
    loginStatusSubscription: any;

    lock = new Auth0Lock('kINf4j2g3D5LRSpkb0RAFXdLFXDGerrE', 'assessmentweb.auth0.com', {
        autoclose: true,
        closable: false,
        container: 'lockContainer',
        auth: {
            redirectUrl: window.location.protocol + '//' + window.location.host + '/login',
            responseType: 'token id_token',
            audience: 'https://localhost:5000/calculate',
            params: {
                scope: 'openid profile email',
            }
        }
    });

    @Input()
    isModal = false;


    constructor(private alertService: AlertService, private authService: AuthService, private configurations: ConfigurationService) {
        this.lock.on("authenticated", (authResult: any) => {
            this.authService.processLoginResponse(authResult);
        });
    }


    ngOnInit() {
        
        if (this.getShouldRedirect()) {
            this.authService.redirectLoginUser();
        }
        else {
            this.loginStatusSubscription = this.authService.getLoginStatusEvent().subscribe(isLoggedIn => {
                if (this.getShouldRedirect()) {
                    this.authService.redirectLoginUser();
                }
            });
        }
        this.lock.show();
    }


    ngOnDestroy() {
        if (this.loginStatusSubscription)
            this.loginStatusSubscription.unsubscribe();
    }


    getShouldRedirect() {
        return !this.isModal && this.authService.isLoggedIn && !this.authService.isSessionExpired;
    }


    showErrorAlert(caption: string, message: string) {
        this.alertService.showMessage(caption, message, MessageSeverity.error);
    }

    closeModal() {
        if (this.modalClosedCallback) {
            this.modalClosedCallback();
        }
    }


    login() {
        this.isLoading = true;
        this.alertService.startLoadingMessage("", "Attempting login...");
    }

    reset() {
        this.formResetToggle = false;

        setTimeout(() => {
            this.formResetToggle = true;
        });
    }
}
