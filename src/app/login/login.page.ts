import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../services/user.service";
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {ToastController} from "@ionic/angular";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  showPassword = false;
  passwordToggleIcon = 'eye-off-outline';
  validations_form: FormGroup;

  constructor(
      private toastCtrl: ToastController,
      private authService : AuthService,
      private formBuilder: FormBuilder,
      private router: Router,
      private userService: UserService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.validations_form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
    });
  }

  async presentToast(toastMessage: string, colorMessage: string) {
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 2000,
      position: 'bottom',
      color: colorMessage,
    });
    await toast.present();
  }

  onLogin(){
    if(this.validations_form.valid){
      this.authService.loginUser(this.validations_form.value).then(
          (res) => {
            this.validations_form.reset();
            this.router.navigateByUrl('/tabs/maps');
          },
          (err) => {
            this.presentToast("Email atau password yang diisi salah.", "danger");
          }
      );
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
    if (this.passwordToggleIcon === 'eye-off-outline') {
      this.passwordToggleIcon = 'eye-outline';
    } else {
      this.passwordToggleIcon = 'eye-off-outline';
    }
  }
}
