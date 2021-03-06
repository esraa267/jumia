import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/Authontication/auth.service';
import { UsersService } from 'src/app/Services/Users/users.service';
import IUser from 'src/app/ViewModels/IUser';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css'],
})
export class UserRegisterComponent implements OnInit {
  errorMessage: string = '';
  IsLoggedByFacebook: boolean = false;
  userID:any;
  constructor(
    private AuthService: AuthService,
    private userService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {}
  Signup(form: any) {
    let data: any = {
      firstname: form.firstname,
      lastname: form.lastname,
      Phone: form.phone,
      email:form.email,
      IsSeller: false,
    };
    this.AuthService.Signup(form.email, form.password).subscribe(() => {
      
      this.AuthService.User?.subscribe(id=>{
        if (id==true) {
          this.errorMessage = '';
          this.userService.AddUser(localStorage.getItem('uid')!, data).then(() => {
            this.router.navigate(['/Products']);
          });
        } else {
          this.errorMessage = this.AuthService.errorMsg;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        }
      })
     
    });
  }
  SignupFacebook() {
    this.AuthService.LoginFacebook().subscribe(() => {
      if (this.userID) {
        this.errorMessage = '';
      } else {
        this.errorMessage = this.AuthService.errorMsg;
      }
    });
  }
}
