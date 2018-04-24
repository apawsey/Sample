export class User {
    // Note: Using only optional constructor properties without backing store disables typescript's type checking for the type
    constructor(id?: string, userName?: string, email?: string, photo?: string) {

        this.id = id;
        this.userName = userName;
        this.email = email;
        this.photo = photo;
    }


    get friendlyName(): string {
        let name = this.userName;

        return name;
    }


    public id: string;
    public userName: string;
    public email: string;
    public photo: string;
    public isEnabled: boolean;
}
