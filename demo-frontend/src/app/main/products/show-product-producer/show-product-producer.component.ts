import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, fromEvent, merge, Observable, Observer, tap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ShowProductDatasource } from 'src/app/model/datasource/showproduct.datasource';
import { Product } from 'src/app/model/product';
import { AnyField, AnyPageFilter, SortFilter } from 'src/app/model/rest/filter';
import { ProductService } from 'src/app/services/product.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import swal from 'sweetalert2';

@Component({
  //selector: 'app-show-product',
  templateUrl: './show-product-producer.component.html',
  styleUrls: ['./show-product-producer.component.scss']
})
export class ShowProductProducerComponent implements OnInit {

  dataSource: ShowProductDatasource;
  login: string;


  displayedColumns = [
    'image',
    'select',
    'id',
    'name',
    'quantity',
    'typeProd',
    'price'
  ];
  fields = ['id', 'name', 'quantity', 'description', 'typeProd', 'price'];

  selection = new SelectionModel<Product>(true, []);
  error = false;


  //@ViewChild('edit') editTemplate: any;
  highlightedRow: Product;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('input') input: ElementRef;

  constructor(
    private productService: ProductService,
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ){
    this.login = this.authService.getUserName();
  }

  ngOnInit() {
    this.dataSource = new ShowProductDatasource(this.productService);
    const pageFilter = new AnyPageFilter(
      '',
      this.fields.map((field) => new AnyField(field)),
      0, 
      20,
      'name'
    );
    this.dataSource.getMyProducts(pageFilter, this.login);
  }

  ngAfterViewInit(): void {
    // server-side search
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.loadProductsPage();
        })
      )
      .subscribe();

    // reset the paginator after sorting
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.selection.clear();
    });

    // on sort or paginate events, load a new page
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.loadProductsPage();
        })
      )
      .subscribe();
  }

  loadProductsPage() {
    this.selection.clear();
    this.error = false;
    const pageFilter = new AnyPageFilter(
      this.input.nativeElement.value,
      this.fields.map((field) => new AnyField(field)),
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
    pageFilter.order = [];
    pageFilter.order.push(
      new SortFilter(this.sort.active, this.sort.direction.toString())
    );
    this.dataSource.getMyProducts(pageFilter, this.login);
  }
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.productsSubject.value.forEach(row => this.selection.select(row));
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.productsSubject.value.length;
    return numSelected === numRows;
  }

  onDelete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: this.translate.instant('delete-product-confirmation'),
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.delete();
        swal.fire(this.translate.instant('PRODUCT_DELETE_SUCCESS'), '','success').then((res) => {
        return new Observable((observer: Observer<boolean>) =>
          observer.next(true)
        )});
      } else {
        swal.fire(this.translate.instant('PRODUCT_DELETE_ERROR'), '','error').then((res) => {
        return new Observable((observer: Observer<boolean>) =>
          observer.next(false)
        );
      })
      }
    });
  }

  delete() {
    const product = this.selection.selected[0];
    this.selection.deselect(product);
    if (this.selection.selected && this.selection.selected.length === 0) {
      this.productService.deleteProduct(product.id).subscribe((response) => {
        console.log(response)
        if (response.responseCode !== 'OK') {
           this.error = true;
         } else {
          this.loadProductsPage();
         }
      });
    } else {
      this.productService.deleteProduct(product.id).subscribe((response) => {
        console.log(response);
        if (response.responseCode !== 'OK') {
           this.error = true;
        }
        this.delete();
      });
    }
  }

  onAdd(){
    this.router.navigate(['/products/createProduct']);
  }

  onEdit(row: Product) {
    this.highlightedRow = row;
    this.router.navigate(['/products/edit/' + row.id]);
  }

  }


