import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {LoadingController, ToastController} from "@ionic/angular";
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {UserService} from "../services/user.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  validations_form: FormGroup;
  idUser: string;
  constructor(
      private toastCtrl: ToastController,
      private loadingCtrl: LoadingController,
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
      username: new FormControl(null, Validators.compose([
        Validators.required
      ])),
      fullname: new FormControl(null, Validators.compose([
        Validators.required
      ])),
      email: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl(null, Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
      confirmPassword: new FormControl(null, Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
    }, {validator: this.matchingPasswords('password', 'confirmPassword')});
  }

  matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup): {[key: string]: any} => {
      let password = group.controls[passwordKey];
      let confirmPassword = group.controls[confirmPasswordKey];

      if (password.value !== confirmPassword.value) {
        return {
          mismatchedPasswords: true
        };
      }
    }
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Registering...',
      duration: 1000,
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!');
  }

  async presentToast(toastMessage: string, colorMessage: string) {
    const toast = await this.toastCtrl.create({
      message: toastMessage,
      duration: 3000,
      position: 'bottom',
      color: colorMessage,
    });
    await toast.present();
  }

  addUser(){
    this.validations_form.value.password = null;
    this.validations_form.value.confirmPassword = null;
    this.userService.create(this.idUser, this.validations_form.value);
    this.router.navigateByUrl('login');
    this.presentToast("Registration success, please login next", "success");
  }

  onRegister(){
    if(this.validations_form.valid){
      this.presentLoading().then(() => {
        this.authService.registerUser(this.validations_form.value)
            .then(res => {
              this.idUser = res.user.uid;
              this.addUser();
            }, err => {
              console.log(err);
              this.presentToast("Email has been used by other users, please use another email", "warning");
            });
      });
    }
  }

}
