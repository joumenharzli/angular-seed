import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AppState } from './app.state';

@Component({
  selector: 'app-cookapp',
  template: `<h1>Hello {{name}}</h1>`,
})
export class AppComponent {
  name = 'Angular';
  num: Observable<Number>;

  constructor(private store: Store<AppState>, private http: Http) {

    store.subscribe((res) => {
      console.log(res);
    });

    this.http.get(`https://jsonplaceholder.typicode.com/todos`).map(res => res.json()).subscribe(
      (res) => {
        console.log(res);
      });
  }
}
