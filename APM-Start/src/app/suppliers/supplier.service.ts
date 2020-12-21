import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { throwError, Observable, of } from 'rxjs';
import { Supplier } from './supplier';
import { catchError, concatMap, map, mergeMap, shareReplay, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  suppliersUrl = 'api/suppliers';

  suppliersWithMap$ = of(1, 5, 8)
  .pipe(
    map(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)
    )
  );

suppliers$ = this.http.get<Supplier[]>(this.suppliersUrl)
  .pipe(
    tap(data => console.log('suppliers', JSON.stringify(data))),
    shareReplay(1),
    catchError(this.handleError)
  );


  // these three below are all examples of HIGHER ORDER OBSERVABLES

  // concatMap waits for the inner observable to complete before processing the next one from the outer
  suppliersWithConcatMap$ = of(1, 5, 8) // of creates the source/outer observable
  .pipe(
    tap(id => console.log('concatMap source Observable:', id)),
    // concatMap, mergeMap, and switchMap are all higher order mapping operators
    // they are responsible for creating the inner observable internally
    concatMap(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)
    )
  );

  // mergeMap processes inner observables in parellel (which can affect the order of the emitted items)
  suppliersWithMergeMap$ = of(1, 5, 8)
  .pipe(
    tap(id => console.log('mergeMap source Observable:', id)),
    mergeMap(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)
    )
  );

  // switchMap unsubscribes from the prior inner observable and switches to the new one
  suppliersWithSwitchMap$ = of(1, 5, 8) 
  .pipe(
    tap(id => console.log('switchMap source Observable:', id)),
    switchMap(id => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)
    )
  );

  constructor(private http: HttpClient) {
    // this.suppliersWithMap$
    // .subscribe(o => o.subscribe(
    //   item => console.log('map result', item)
    // ));

    // this.suppliersWithConcatMap$.subscribe(item => console.log('concatMap result:', item));
    // this.suppliersWithMergeMap$.subscribe(item => console.log('mergeMap result:', item));
    // this.suppliersWithSwitchMap$.subscribe(item => console.log('switchMap result:', item));
   }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
