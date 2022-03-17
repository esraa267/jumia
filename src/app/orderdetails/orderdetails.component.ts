import { Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { doc } from 'firebase/firestore';
import { Subject } from 'rxjs';
import { FeedbackService } from '../Services/FeedBack/feedback.service';
import { OrdersService } from '../Services/Orders/orders.service';
import { IFeedBack } from '../ViewModels/ifeed-back';
import { IOrder } from '../ViewModels/iorder';
import IProduct from '../ViewModels/Iproduct';
import { IProductOrder } from '../ViewModels/IProductOrder';

@Component({
  selector: 'app-orderdetails',
  templateUrl: './orderdetails.component.html',
  styleUrls: ['./orderdetails.component.css'],
})
export class OrderdetailsComponent implements OnInit,OnChanges {
  productId: any;
  flag!:boolean
  orders: IOrder = {} as IOrder;
  produtorderd: IProductOrder[] = [];
  Productid= new Subject<string>();
@ViewChild('pid') pid!:ElementRef
  constructor(
    private activateRouteServicse: ActivatedRoute,
    private orderSrvc: OrdersService,
    private feedBackServc: FeedbackService,
    private Firs: Firestore,private route :Router
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
  
  }

  ngOnInit(): void {
    this.activateRouteServicse.paramMap.subscribe((paramMap) => {
      this.productId = paramMap.get('id');
      console.log(this.productId);
      this.orderSrvc
        .getOrderDetailsByID(this.productId)
        .subscribe((el: any) => {
          this.orders = el as IOrder;
          let ids: string[] = [];
          this.produtorderd = el.Product.map((element: any) => {
            return {
              ...element,
            };
          });
          el.Product.map((ele: any) => {
            ids.push(ele.Product_Id.id);
          });
          this.orderSrvc.getUserProducts(ids).subscribe((prod) => {
            this.produtorderd = prod.map((p, index) => {
              return {
                id: p.payload.doc.id,
                Product: p.payload.doc.data() as IProduct,
                ...this.produtorderd[index],
              };
            });
          });
        });
    });
  }
  submitBack(feedback: string) {

    


    var today = new Date();
    let data: IFeedBack = {
      date:
        today.getMonth() +
        1 +
        '/' +
        today.getDate() +
        '/' +
        today.getFullYear(),
      product_id: doc(this.Firs, 'Products/' +   this.pid.nativeElement.innerHTML),
      feedback: feedback,
      userID: localStorage.getItem('uid'),
    };
    console.log(data);
    
    this.feedBackServc.addfeedback(data);
  //  this.route.navigate([this.route.url])
    window.location.reload()
  }
  ss(id: any) {
    this.pid.nativeElement.innerHTML=id
    this.feedBackServc
    .checkFeedBack(localStorage.getItem('uid'),id)
    .subscribe((el) => {
      if (el.length > 0) {
        this.flag = false;
      } else {
        this.flag = true;
      }
    });
  }

}
