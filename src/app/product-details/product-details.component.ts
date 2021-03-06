import { CartServiceService } from './../Services/Cart/cart-service.service';
import { Observable, Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../Services/Products/products.service';
import IProduct from '../ViewModels/Iproduct';
import { SellerService } from '../Services/Seller/seller.service';
import IUser from '../ViewModels/IUser';
import { AuthService } from '../Services/Authontication/auth.service';
import { doc, Firestore } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { IFeedBack } from '../ViewModels/ifeed-back';
import { FavouriteListService } from '../Services/favourite/favourite-list.service';
import { ISeller } from '../ViewModels/ISeller';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent implements OnInit {
  productId: any;
  product!: IProduct;
  products: IProduct[] = [];
  categoryName: any;
  productCatObservable?: Subscription;
  productObservable!: Subscription;
  add: number = -1;
  flag: boolean = false;
  qntflag: boolean = false;
  num!: number;
  seller!: ISeller;
  flaglang: string = '';
  favList: [] = [];
  uid:boolean=false;

  datainfo: any;
  dataprofile = {
    favorite: {},
  };
  favorite: any;
  feedBacks: IFeedBack[] = [];
  btnFlag!: boolean;
  constructor(
    private activateRouteServicse: ActivatedRoute,
    private productServc: ProductsService,
    private cartServc: CartServiceService,
    private router: Router,
    private sellerServc: SellerService,
    private fc: FavouriteListService,
    private auth:AuthService
  ) {}

  ngOnInit(): void {
    this.productServc.lang.subscribe((e) => {
      this.flaglang = e;
      console.log(this.flaglang);
    });
    this.auth.User.subscribe(e=>{
      this.uid=e
    })
    //******** */Get category of selected product***********//
    this.activateRouteServicse.queryParamMap.subscribe((param) => {
      this.categoryName = param.get('query');
      console.log(this.categoryName);
    });
    /////////////////////////

    /////////////////////////
    this.productCatObservable = this.productServc
      .getDataByCategoryName(this.categoryName)
      .subscribe((data) => {
        this.products = data.map((elemnt) => {
          return {
            id: elemnt.payload.doc.id,
            ...(elemnt.payload.doc.data() as IProduct),
          };
        });
      });

    //*****Get Selected product******//
    this.activateRouteServicse.paramMap.subscribe((paramMap) => {
      this.productId = paramMap.get('id');

      let x = this.productServc
        .getProductById(this.productId)
        .subscribe((prod) => {
          let y = this.sellerServc.getSeller(prod?.SellerID!).subscribe(() => {
            this.sellerServc.seller.subscribe((el) => {
              this.product = prod!;
              this.seller = el  ;
              //////////////////////
            });
          });
        });
    });

    /////////////*******GetFeedBack********///////////////
    this.productServc.getPrroductFeedBack(this.productId).subscribe((feed) => {
      this.feedBacks = feed as IFeedBack[];
      console.log(this.productId);
      console.log(this.feedBacks);
      console.log(feed);
    });
  }
  backToProd() {
    this.router.navigate(['/Products']);
  }
  //  addToCart(){
  //     console.log(this.productId);
  //     this.flag=true;
  //  }
  buy(qtn: any) {}

  addToCart(product: IProduct) {
    console.log(product);

    this.cartServc.addItem({ ...product, id: this.productId });
    this.cartServc.qntFlag.subscribe((e) => {
      if (e) {
        this.flag = false;
        this.qntflag = true;
      } else {
        this.flag = true;
        this.qntflag = false;
      }
    });
    this.flag = true;

    setTimeout(() => {
      this.flag = false;
      this.qntflag = false;
    }, 1500);
  }
  // addToCart(product:IProduct){
  //   let prodArr = JSON.parse(localStorage.getItem("products") || "[]");
  //      prodArr.push(product);
  //   localStorage.setItem("products", JSON.stringify(prodArr));
  //   console.log(this.cartServc.num.length);
  // }

  // ==================addtofavLise"taqwa"========================
  save(id: any) {
    console.log(id);
    
    let userId = localStorage.getItem('uid');
    let x=this.fc.checkITem(userId, this.productId).subscribe((res) => {
      if (res.length == 0) {
        this.fc.addToFavourite(userId, {...id,prdid: this.productId});
      }
x.unsubscribe()
    });

    console.log('add');
  }
}
