import { Component, OnInit, OnDestroy, Input } from "@angular/core";

import { AlertService, MessageSeverity, DialogType } from '../../services/alert.service';
import { AuthService } from "../../services/auth.service";
import { ConfigurationService } from '../../services/configuration.service';
import { Utilities } from '../../services/utilities';
import { UserLogin } from '../../models/user-login.model';
import Auth0Lock from 'auth0-lock';
import { Location } from '@angular/common';

@Component({
    selector: "app-login",
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit, OnDestroy {

    userLogin = new UserLogin();
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
            audience: 'https://assessmentweb.auth0.com/userinfo',
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

        //this.authService.login(this.userLogin.email, this.userLogin.password, this.userLogin.rememberMe)
        //    .subscribe(
        //    user => {
        //        setTimeout(() => {
        //            this.alertService.stopLoadingMessage();
        //            this.isLoading = false;
        //            this.reset();

        //            if (!this.isModal) {
        //                this.alertService.showMessage("Login", `Welcome ${user.userName}!`, MessageSeverity.success);
        //            }
        //            else {
        //                this.alertService.showMessage("Login", `Session for ${user.userName} restored!`, MessageSeverity.success);
        //                setTimeout(() => {
        //                    this.alertService.showStickyMessage("Session Restored", "Please try your last operation again", MessageSeverity.default);
        //                }, 500);

        //                this.closeModal();
        //            }
        //        }, 500);
        //    },
        //    error => {

        //        this.alertService.stopLoadingMessage();

        //        if (Utilities.checkNoNetwork(error)) {
        //            this.alertService.showStickyMessage(Utilities.noNetworkMessageCaption, Utilities.noNetworkMessageDetail, MessageSeverity.error, error);
        //        }
        //        else {
        //            let errorMessage = Utilities.findHttpResponseMessage("error_description", error);

        //            if (errorMessage)
        //                this.alertService.showStickyMessage("Unable to login", errorMessage, MessageSeverity.error, error);
        //            else
        //                this.alertService.showStickyMessage("Unable to login", "An error occured whilst logging in, please try again later.\nError: " + error.statusText || error.status, MessageSeverity.error, error);
        //        }

        //        setTimeout(() => {
        //            this.isLoading = false;
        //        }, 500);
        //    });
    }

    reset() {
        this.formResetToggle = false;

        setTimeout(() => {
            this.formResetToggle = true;
        });
    }
}
