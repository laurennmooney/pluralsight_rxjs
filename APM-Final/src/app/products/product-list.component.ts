import { Component, ChangeDetectionStrategy } from '@angular/core';

import { of, combineLatest, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ProductService } from './product.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';

  // Action stream
  private selectCategoryAction = new BehaviorSubject<number>(0);

  // Merge Data stream with Action stream
  // To filter to the selected category
  products$ = combineLatest(
    this.productService.productsWithAdd$,
    this.selectCategoryAction
  )
    .pipe(
      map(([products, categoryId]) =>
        products.filter(product =>
          categoryId ? product.categoryId === categoryId : true)
      ),
      catchError(err => {
        this.errorMessage = err;
        return of(null);
      })
    );

  // Categories for drop down list
  categories$ = this.productCategoryService.productCategories$;

  constructor(private productService: ProductService,
    private productCategoryService: ProductCategoryService) { }

  onSelected(categoryId: string): void {
    this.selectCategoryAction.next(+categoryId);
  }

  onAdd() {
    this.productService.addOne();
  }
}
