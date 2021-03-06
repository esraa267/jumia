import { Component, OnInit } from '@angular/core';

import { Subject, combineLatest, retry, Subscription } from 'rxjs';
import { CartServiceService } from './../../Services/Cart/cart-service.service';
import { ProductsService } from 'src/app/Services/Products/products.service';
import IProduct from 'src/app/ViewModels/Iproduct';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/Authontication/auth.service';
import ITest from 'src/app/ViewModels/test';
import { ICart } from 'src/app/ViewModels/icart';
import { UsersService } from 'src/app/Services/Users/users.service';
import IUser from 'src/app/ViewModels/IUser';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  sideBarOpen: boolean = false;
  searchitem: string = '';
  islogged: boolean = false;
  isUser: boolean = false;
  uid: any;
  private startat = new Subject<string>();
  private startobservable = this.startat.asObservable();

  filtteredProducts: IProduct[] = [];
  itemIncart: number = 0;
  words: ITest = {
    wrods: [],
  };
  prd!: IProduct;
  flag: string = '';
  id!: any;
  userName: string = '';
  x!: Subscription;
  constructor(
    private ProductsService: ProductsService,
    private cartServc: CartServiceService,
    private router: Router,
    private auth: AuthService,
    private user: UsersService
  ) {}

  ngOnInit(): void {
    this.ProductsService.lang.subscribe((e) => {
      this.flag = e;
    });

    this.auth.User?.subscribe((user) => {
      if (user == true) {
        this.uid = localStorage.getItem('uid');
        console.log(user);
        this.isUser = true;
        this.x = this.cartServc
          .getCartDtataFireStor(localStorage.getItem('uid'))
          .subscribe((el) => {
           
            var num = 0;
            el.forEach((e) => (num += e.payload.doc.data().subtotal!));
            this.itemIncart = num;
          });
      } else {
        
        this.isUser = false;
        this.cartServc.cartItems.subscribe((el: ICart[]) => {
          console.log(el.length);

          var num = 0;
          el.forEach((e) => (num += e.subtotal!));
          this.itemIncart = num;
          console.log(el);
        });
        this.x.unsubscribe();
      }
    });

    this.startobservable.subscribe((value) => {
      this.ProductsService.SearchQuery(value).subscribe((items) => {
        this.filtteredProducts = items.map((item) => {
          return {
            id: item.payload.doc.id,
            ...item.payload.doc.data(),
          };
        });
      });
    });
    this.user.getUserByID(localStorage.getItem('uid')!).subscribe((e) => {
      this.userName = e?.FirstName!;
    });
    console.log(this.itemIncart);
  }
  toggleSideBar() {
    this.sideBarOpen = !this.sideBarOpen;
  }
  search() {
    console.log(this.searchitem);

    setTimeout(() => {
      this.startat.next(this.searchitem);
    }, 900);
  }
  searchBtn() {
    if (this.filtteredProducts.length == 0) {
      this.router.navigate(['/NotFound']);
    }
  }
  route(id: string) {
    console.log(this.filtteredProducts);

    this.filtteredProducts = [];
    this.searchitem = '';
    this.router.navigate(['/Products', id]);
  }
  changeDir(dir: string) {
    this.ProductsService.setLanguage(dir);
  }
  Logout() {
    this.auth.Logout().then((ee) => {
      localStorage.removeItem('uid');

      localStorage.setItem('cart', JSON.stringify([]));

      // this.cartServc.setCartData([]);
      // this.cartServc.getCartData();
      // localStorage.removeItem('uid');
      this.cartServc.cartItems.next([]);
      console.log(this.itemIncart);

      this.auth.User.next(false);
    });
  }
}
