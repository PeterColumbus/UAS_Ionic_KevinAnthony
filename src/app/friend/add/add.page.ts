import { Component, OnInit } from '@angular/core';
import {LoadingController, ToastController} from "@ionic/angular";
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {
  private searchValue: string;
  private idUser: string;
  private userData: any;
  private usersData: any;
  private userFriends: any[] = [];
  private searchedUserData: any;
  private boolUserFound: boolean = false;
  private boolUserIsFriend: boolean = false;

  constructor(
      private authService: AuthService,
      private userService: UserService,
      private toastCtrl: ToastController,
      private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.getIdUser();
  }

  getIdUser(){
    this.authService.userDetails().subscribe(res => {
      if(res !== null){
        this.idUser = res.uid;
        this.getUsersData();
      }
    }, err => {
      console.log(err);
    })
  }

  getUserData(){
    this.userData = this.usersData.find(user => {
      return user.key === this.idUser;
    });
    if(this.userData.friends){
      this.userFriends = this.userData.friends;
    }
  }

  getUsersData(){
    this.userService.getAll().snapshotChanges().pipe(
        map(changes =>
            changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
        )
    ).subscribe(data => {
      this.usersData = data;
      this.getUserData();
    });
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

  async presentLoading(){
    const loading = await this.loadingCtrl.create({
      message: "Menambahkan teman...",
      duration: 1000
    });
    await loading.present();

    const {role, data} = await loading.onDidDismiss();
    console.log("Loading dismissed!");
  }

  getSearchedUser(searchedEmail: string){
    return{...this.usersData.find(user => {
        return (user.email.toLowerCase() === searchedEmail.toLowerCase()) && (user.key != this.idUser);
      })};
  }

  checkUserFriends(){
    var idxFriend = this.userFriends.indexOf(this.searchedUserData.key);
    if(idxFriend == -1){
      this.boolUserIsFriend = false;
    }
    else{
      this.boolUserIsFriend = true;
    }
  }

  searchUser(){
    if(this.searchValue != ''){
      this.searchedUserData = this.getSearchedUser(this.searchValue);
      if(JSON.stringify(this.searchedUserData) === '{}'){
        this.boolUserFound = false;
        this.presentToast("User tidak ditemukan", "danger");
      }
      else{
        this.boolUserFound = true;
        if(this.userData.friends){
          this.checkUserFriends();
        }
      }
    }
  }

  addFriend(){
    this.presentLoading().then(() => {
      this.userFriends.push(this.searchedUserData.key);
      this.userData.friends = this.userFriends;
      this.userService.update(this.idUser, this.userData);
      this.boolUserIsFriend = true;
      this.presentToast("User berhasil ditambahkan ke dalam Friend List", "success");
    });
  }

  imageLoaded(event){
    var target = event.target || event.srcElement || event.currentTarget;
    var idAttr = target.attributes.id;
    var idValue = idAttr.nodeValue;
    var profileWidth = document.getElementById(idValue).offsetWidth;
    document.getElementById(idValue).style.height = profileWidth + "px";
  }
}
