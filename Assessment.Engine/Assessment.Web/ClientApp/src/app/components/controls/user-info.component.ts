




import { Component, OnInit, ViewChild, Input } from '@angular/core';

import { AlertService, MessageSeverity } from '../../services/alert.service';
import { AccountService } from "../../services/account.service";
import { Utilities } from '../../services/utilities';
import { User } from '../../models/user.model';
import { UserEdit } from '../../models/user-edit.model';


@Component({
    selector: 'user-info',
    templateUrl: './user-info.component.html',
    styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {

    private isEditMode = false;
    private isNewUser = false;
    private isSaving = false;
    private isChangePassword = false;
    private isEditingSelf = false;
    private showValidationErrors = false;
    private editingUserName: string;
    private uniqueId: string = Utilities.uniqueId();
    private user: User = new User();
    private userEdit: UserEdit;

    public formResetToggle = true;

    @Input()
    isViewOnly: boolean;

    @ViewChild('f')
    private form;

    //ViewChilds Required because ngIf hides template variables from global scope
    @ViewChild('userName')
    private userName;

    @ViewChild('email')
    private email;


    constructor(private alertService: AlertService, private accountService: AccountService) {
    }

    ngOnInit() {
        this.loadCurrentUserData();
    }



    private loadCurrentUserData() {
        this.alertService.startLoadingMessage();

        this.onCurrentUserDataLoadSuccessful(this.accountService.currentUser);
    }


    private onCurrentUserDataLoadSuccessful(user: User) {
        this.alertService.stopLoadingMessage();
        this.user = user;
    }

    private onCurrentUserDataLoadFailed(error: any) {
        this.alertService.stopLoadingMessage();
        this.alertService.showStickyMessage("Load Error", `Unable to retrieve user data from the server.\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
            MessageSeverity.error, error);

        this.user = new User();
    }

    private showErrorAlert(caption: string, message: string) {
        this.alertService.showMessage(caption, message, MessageSeverity.error);
    }






    private close() {
        this.userEdit = this.user = new UserEdit();
        this.showValidationErrors = false;
        this.resetForm();
        this.isEditMode = false;
    }

    resetForm(replace = false) {
        this.isChangePassword = false;

        if (!replace) {
            this.form.reset();
        }
        else {
            this.formResetToggle = false;

            setTimeout(() => {
                this.formResetToggle = true;
            });
        }
    }
}
