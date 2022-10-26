import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ActivatedRoute, Route, Router } from '@angular/router';
import { LoggerService } from 'src/app/services/logger.service';
import { Product } from 'src/app/model/product';
import { ProductService } from 'src/app/services/product.service';
import { User } from 'src/app/model/user';
import { Profile } from 'src/app/model/profile';
import { CreateProductByAdminComponent } from '../create-product-by-admin/create-product-by-admin.component';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/user.service';

interface Tipo {
  value: string,
}

@Component({
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss'],
})

export class EditProductComponent implements OnInit {
  idProduct: number;

  productForm: FormGroup;
  product: Product;
  user: User;
  errores: string[];

  categories: Tipo[] = [
    { value: 'unidades' },
    { value: 'kilos' },
    { value: 'gramos' },
    { value: 'litros' }
  ];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private logger: LoggerService
  ) {
    this.product = new Product();
    this.product.user = new User();
    userService.getUser(authService.getUserName()).subscribe(response => this.user = response);
  }
  value: string;

  ngOnInit() {
    this.createFormGroup();
    this.idProduct = this.route.snapshot.params['id'];

    if (this.idProduct) {
      this.productService.getProduct(this.idProduct).subscribe(
        response => {
          this.product = response;
          this.productForm.patchValue(this.product, { emitEvent: false, onlySelf: false });
          this.logger.info(this.product);
        }
      );
    }
  }



  onFormChanges() {
    this.productForm.valueChanges.subscribe((val) => { });
  }

  createFormGroup() {
    this.productForm = this.fb.group({
      ownername: [this.product.user.login],
      name: [this.product.name],
      typeProd: [this.product.typeProd],
      quantity: [this.product.quantity],
      description: [this.product.description],
      price: [this.product.price],
    });
  }

  save() {
    const newProduct: Product = Object.assign({}, this.productForm.value);
    newProduct.id = this.idProduct;
    console.log(newProduct);
    if (newProduct.id) {
      this.productService.editProduct(newProduct).subscribe((response) => {
        this.redirectList(response);
      });
    }
  }

  redirectList(response: any) {
    if (response.responseCode === 'OK') {
      if (this.isAdmin(this.user)) {
        this.router.navigate(['products/showProducts']);
      } else {
        this.router.navigate(['products/myProducts']);
      }
    } else {
      console.log(response);
    }
  }

  compareObjects(o1: any, o2: any): boolean {
    if (o1 && o2) {
      return o1.id === o2.id;
    } else {
      return false;
    }
  }

  cancel() {
    if (this.isAdmin(this.user)) {
      this.router.navigate(['products/showProducts']);
    } else {
      this.router.navigate(['products/myProducts']);
    }
  }

  isAdmin(user: User) {
    let admin = false;
    user.profiles.forEach(profile => {
      if (profile.id == 1) {
        admin = true;
      }
    });
    return admin;
  }
}
