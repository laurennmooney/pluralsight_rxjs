import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, EMPTY, Subject } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { Product } from '../product';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  product$ = this.productService.selectedProduct$
  .pipe(
    catchError(error => {
      this.errorMessage$ = error;
      return EMPTY;
    })
  );

  pageTitle$ = this.product$
  .pipe(
    map((p: Product) => 
      p ? `Product Detail for: ${p.productName}` : null)
  );

  productSuppliers$ = this.productService.selectedProductSuppliers$
  .pipe(
    catchError(error => {
      this.errorMessageSubject.next(error);
      return EMPTY;
    })
  );

  // combining our many streams into one main stream for use in the view.
  vm$ = combineLatest([
    this.product$,
    this.productSuppliers$,
    this.pageTitle$
  ])
  .pipe(
    filter(([product]) => Boolean(product)),
    map(([product, productSuppliers, pageTitle]) => ({product, productSuppliers, pageTitle}))
  );

  constructor(private productService: ProductService) { }

}
