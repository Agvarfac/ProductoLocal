import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Product } from 'src/app/model/product';
import { ProductService } from 'src/app/services/product.service';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/model/user';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import swal from "sweetalert2";
import { TranslateService } from '@ngx-translate/core';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { Observable } from 'rxjs/internal/Observable';


interface Tipo {
  value: string,
}

@Component({
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss']
})

export class CreateProductComponent implements OnInit {

  product: Product;
  productForm: FormGroup;
  userOwnerLogin:string;
  userOwner:User;

  /* Carga de imagenes*/
  selectedFiles?: FileList;
  selectedFileNames: string[] = [];
  image: string;
  
  previews: string[] = [];
  imageInfos?: Observable<any>;

  /*  fin carga imagenes*/ 

  @ViewChild('UploadFileInput') uploadFileInput: ElementRef;

   categories: Tipo[] = [
    { value: 'unidades'},
    { value: 'kilos'},
    { value: 'gramos'},
    { value: 'litros'}
  ];

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private userService: UserService,
    ) {
    this.product = new Product();
    this.userOwnerLogin = this.authService.getUserName();
    this.userService.getUser(this.userOwnerLogin).subscribe(
      response => {
        this.userOwner = response;
      }
/*
      ,
      (err) => {
        this.errors = err.error as string[];
        console.error(err.status);
        console.error(this.errors);
      }
      );
*/
    )
  }

  ngOnInit(): void {
    this.createFormGroup();
  }

  createFormGroup() {
    this.productForm = this.fb.group({
      name: [this.product.name],
      typeProd: [this.product.typeProd],
      quantity: [this.product.quantity],
      description:[this.product.description],
      price: [this.product.price],
      // imageUrl: [this.selectedFileNames[0]],
      // image: [this.image]
    },
    );
  }

  cancel() {
    this.router.navigate(['/products/myProducts']);
  }


  save() {
    const newProduct: Product = Object.assign({}, this.productForm.value);
    newProduct.user = this.userOwner;
    newProduct.imageUrl = this.selectedFileNames[0];
    newProduct.image = this.image;
    console.log(newProduct);
    let message;
    this.productService.createProduct(newProduct).subscribe((response) => {
      console.log(this);
      message = this.translate.instant("PRODUCT_CREATE_SUCCESS")
      swal.fire(message, "", 'success').then((res) => this.redirectList(response));
      
    }, err => {
      console.log(err.message);
      swal.fire({
        confirmButtonColor: '#bfedff',
        title: this.translate.instant('ERROR'),
        text: this.translate.instant(message),
        icon: 'error'
      });
    }
    );
  }

  redirectList(response: any) {
    if (response.responseCode === 'OK') {
      this.router.navigate(['/products/myProducts']);
    } else {
      console.log(response);
    }
  }

  selectFiles(event) : void {
    
    this.selectedFileNames = [];
    this.selectedFiles = event.target.files;

   this.previews = [];
    if (this.selectedFiles && this.selectedFiles[0]) {
      const numberOfFiles = this.selectedFiles.length;
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();
  
        reader.onload = (e: any) => {
          //console.log(e.target.result);
          this.image = e.target.result;
          //console.log(typeof this.image)
          //console.log('>>>>>>>>>>>>> ' + this.image);
          //console.log(this.image.indexOf(","));
          //console.log(this.image.slice(this.image.indexOf(",") + 1));
          this.image = this.image.slice(this.image.indexOf(",") + 1);
          console.log('>>>>>>>>>>>>> ' + this.image);
          this.previews.push(e.target.result);
        };
  
        reader.readAsDataURL(this.selectedFiles[i]);

        console.log(reader);

        console.log("Objeto creado: " + this.selectedFiles[0].type);

        console.log("Nombre asignado: " + this.selectedFiles[0].name);
       
        this.selectedFileNames.push(this.selectedFiles[i].name);

        console.log("Nombre: " + this.selectedFileNames[0]);
      }
    } 
  }
}
