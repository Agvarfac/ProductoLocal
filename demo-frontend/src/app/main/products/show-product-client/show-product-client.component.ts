import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent } from 'rxjs';
import { ShowProductDatasource } from 'src/app/model/datasource/showproduct.datasource';
import { Product } from 'src/app/model/product';
import { AnyField, AnyPageFilter } from 'src/app/model/rest/filter';
import { ProductService } from 'src/app/services/product.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ElementRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, merge, Observable, Observer, tap } from 'rxjs';

interface Tipo {
  value: string,
  viewValue: string,
}

@Component({
  //selector: 'app-show-product-client',
  templateUrl: './show-product-client.component.html',
  styleUrls: ['./show-product-client.component.scss']
})
export class ShowProductClientComponent implements OnInit {

  dataSource: ShowProductDatasource;
  fields = ['name', 'quantity', 'typeProd', 'price', 'user.login', 'user.city'];
  products: Product[];
  selection = new SelectionModel<Product>(true, []);
  error = false;
  catSel = '';
  sortSel = 'name';
  producerSel = '';
  producers = [''];



  @ViewChild('input') input: ElementRef;
  @ViewChild('category') category: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    private productService: ProductService,
    private translate: TranslateService,
    private router: Router,
  ) { }

  categories: Tipo[] = [
    { value: 'todas', viewValue: 'All' },
    { value: 'bebida', viewValue: 'Drinks' },
    { value: 'fruta', viewValue: 'Fruits' },
    { value: 'hortaliza', viewValue: 'Vegetables' },
    { value: 'legumbre', viewValue: 'Legumes' },
    { value: 'lacteo', viewValue: 'Dairy' },
    { value: 'otro', viewValue: 'Others' },
  ]

  sorting: Tipo[] = [
    { value: 'name', viewValue: 'name' },
    { value: 'price', viewValue: 'price' },
    { value: 'typeProd', viewValue: 'category' }
  ]

  ngOnInit(): void {
    this.dataSource = new ShowProductDatasource(this.productService);
    const pageFilter = new AnyPageFilter(
      '',
      this.fields.map((field) => new AnyField(field)),
      0,
      10,
      this.sortSel
    );
    this.dataSource.getProducts(pageFilter);
    this.productService.getProducts(pageFilter).subscribe((a) => {
      this.products = a.data;
      this.products.forEach(element => {
        if (this.producers.indexOf(element.user.login) < 0) {
          this.producers.push(element.user.login);
        }
      });
      this.producers.sort();
    });
  }

  ngAfterViewInit(): void {
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

    this.paginator.page.pipe(
      tap(() => {
        this.loadProductsPage();
      })
    )
      .subscribe()
  }

  contact(email: string, productName: string, productId: number) {
    location.href = "mailto:" + email + "?Subject=Reserva " + productName + "&body=Hola!%0AMe%20gustaría%20reservar%20este%20producto:%0A-%20#REF: " +  productId +  "%0A-%20Producto: " +  productName + "%0A-%20Cantidad: 1";
  }

  showDetails(id: number) {
    this.router.navigate(['/products/getProductDetail/' + id]);
  }

  readCategorys(name: string) {
    this.catSel = name;
    this.loadProductsPage();
  }
  readProducer(producer: string) {
    this.producerSel = producer;
    this.loadProductsPage();
  }

  sortGrid(sorting: string) {
    this.sortSel = sorting;
    this.loadProductsPage();
  }

  loadProductsPage() {
    this.selection.clear();
    this.error = false;
    let typeValue = this.catSel;
    let cityValue = this.input.nativeElement.value;
    const pageFilter = new AnyPageFilter(
      '',
      this.fields.map((field) => new AnyField(field)),
      this.paginator.pageIndex,
      this.paginator.pageSize,
      this.sortSel
    );
    console.log(typeValue);
    console.log(cityValue);
    console.log(this.producerSel);
    if (cityValue != '' && cityValue != null && typeValue != '' && typeValue != 'All' && this.producerSel != '') {
      console.log("*---* FILTRO: CIUDAD TIPO PRODUCTOR *---*");
      this.dataSource.getProductsCityTypeProducer(pageFilter, cityValue, typeValue, this.producerSel);
      this.productService.findCityTypeProducer(pageFilter, cityValue, typeValue, this.producerSel).subscribe((a) => this.products = a.data);
    } else if (cityValue != '' && cityValue != null && (typeValue != null && typeValue != '' && typeValue != 'All') && (this.producerSel == '')) {
      console.log("*---* FILTRO: CIUDAD tipo *---*");
      this.dataSource.getProductsCityType(pageFilter, cityValue, typeValue);
      this.productService.findCityType(pageFilter, cityValue, typeValue).subscribe((a) => this.products = a.data);
    } else if (cityValue != '' && cityValue != null && (typeValue == null || typeValue == '' || typeValue == 'All') && (this.producerSel == '')) {
      console.log("*---* FILTRO: CIUDAD  *---*");
      this.dataSource.getProductsCity(pageFilter, cityValue);
      this.productService.findCities(pageFilter, cityValue).subscribe((a) => this.products = a.data);
    } else if (typeValue != '' && typeValue != 'All' && typeValue != null && (cityValue == null || cityValue == '') && (this.producerSel == '')) {
      console.log("*---* FILTRO: TIPO  *---*");
      this.dataSource.getProductsType(pageFilter, typeValue);
      this.productService.findTypes(pageFilter, typeValue).subscribe((a) => this.products = a.data);
    } else if (cityValue != '' && cityValue != null && (typeValue == null || typeValue == '' || typeValue == 'All') && (this.producerSel != '')) {
      console.log("*---* FILTRO: CIUDAD PRODUCTOR  *---*");
      this.dataSource.getProductsCityProducer(pageFilter, cityValue, this.producerSel);
      this.productService.findCitiesProducer(pageFilter, cityValue, this.producerSel).subscribe((a) => this.products = a.data);
    } else if ((cityValue == '' || cityValue == null) && (typeValue != null && typeValue != '' && typeValue != 'All') && (this.producerSel != '')) {
      console.log("*---* FILTRO: TIPO  PRODUCTOR*---*");
      this.dataSource.getProductsTypeProducer(pageFilter, typeValue, this.producerSel);
      this.productService.findTypesProducer(pageFilter, typeValue, this.producerSel).subscribe((a) => this.products = a.data);
    } else if ((cityValue == '' || cityValue == null) && (typeValue == null || typeValue == '' || typeValue == 'All') && (this.producerSel != '')) {
      console.log("*---* FILTRO: PRODUCTOR  *---*");
      this.dataSource.getMyProducts(pageFilter, this.producerSel);
      this.productService.getMyProducts(pageFilter, this.producerSel).subscribe((a) => this.products = a.data);
    } else {
      console.log("*---* FILTRO: TODOS  *---*");
      this.dataSource.getProducts(pageFilter);
      this.productService.getProducts(pageFilter).subscribe((a) => this.products = a.data);
    }
  }
}
