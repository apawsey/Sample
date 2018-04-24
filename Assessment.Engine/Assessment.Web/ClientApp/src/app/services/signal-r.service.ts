import { Injectable } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import { Observable } from "rxjs/Observable";
import { CalculationItem } from "../models/calculation-item.model";

@Injectable()
export class SignalRService {

    private _hubConnection: HubConnection;

    constructor() { }

    public connect(url: string): Observable<string> {
        this._hubConnection = new HubConnection(url);
        return Observable.fromPromise(this._hubConnection.start().then(value => {
            return this._hubConnection.invoke("Connect").then((value: string) => {
                return value;
            }).catch(reason => {
                return '';
            });
        }).catch(reason => {
            return '';
            }));

        
    }

    public sendCalculations(items: CalculationItem[]): Observable<CalculationItem[]> {
        return Observable.fromPromise(
        this._hubConnection.invoke("CalculateMultiple", items).then(value => {
            return value;
        }));
    }
    public disconnect(): Observable<boolean> {
        if (this._hubConnection == null)
            return Observable.of(true);
        return Observable.fromPromise(this._hubConnection.stop().then(value => {
            return true;
        }).catch(reason => {
            return false;
        }));
    }
}
