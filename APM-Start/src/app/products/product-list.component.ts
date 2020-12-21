import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Subject, VirtualTimeScheduler } from 'rxjs';
import { catchError, filter, map, timestamp } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();
  selectedCatgoryId = 1;

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  products$ = combineLatest([
    this.productService.productsWithAdd$,
    this.categorySelectedAction$
  ]) 
    .pipe(
      map(([products, selectedCatgoryId]) => 
        products.filter(product => 
          selectedCatgoryId ? product.categoryId === selectedCatgoryId : true
        )),
      catchError(error => {
        this.errorMessageSubject.next(error);
        return EMPTY;
    })
  );

  categories$ = this.productCategoryService.productCategories$
  .pipe(
    catchError(error => {
      this.errorMessageSubject.next(error);
      return EMPTY;
    })
  )

  constructor(private productService: ProductService,
    private productCategoryService: ProductCategoryService) { }

  onAdd(): void {
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
