import { Component, OnInit } from '@angular/core';
import {AlertController, LoadingController} from "@ionic/angular";
import {UserService} from "../services/user.service";
import {AuthService} from "../services/auth.service";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-friend',
  templateUrl: './friend.page.html',
  styleUrls: ['./friend.page.scss'],
})
export class FriendPage implements OnInit {
  private searchValue: string;
  private idUser: string;
  private userData: any;
  private usersData: any;
  private userFriendsData: any[] = [];
  private userFriendsDataFilter: any;
  private userFriends: any[] = [];
  private loading: any;

  constructor(
      private authService: AuthService,
      private userService: UserService,
      private alertCtrl: AlertController,
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

  findUserData(userKey: string){
    return{...this.usersData.find(user => {
        return user.key === userKey;
      })};
  }

  getUserFriends(){
    for(let idx = 0; idx < this.userFriends.length; idx++){
      this.userFriendsData.push(this.findUserData(this.userFriends[idx]));
    }
    this.userFriendsDataFilter = this.userFriendsData;
  }

  getUserData(){
    this.userData = this.findUserData(this.idUser);
    if(this.userData.friends){
      this.userFriends = this.userData.friends;
      this.getUserFriends();
    }
  }

  getUsersData(){
    this.userService.getAll().snapshotChanges().pipe(
        map(changes =>
            changes.map(c => ({key: c.payload.key, ...c.payload.val()}))
        )
    ).subscribe(data => {
      this.userFriendsData = [];
      this.usersData = data;
      this.getUserData();
    });
  }

  async presentAlert(idxItem, userFullname){
    const alert = await this.alertCtrl.create({
      header: 'Apakah Anda Yakin?',
      message: 'Apakah Anda ingin menghapus '+ userFullname +' dari Friend List?',
      buttons:[
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Hapus',
          handler: () => this.deleteFriends(idxItem)
        }
      ]
    });
    await alert.present();
  }

  async presentLoading(loadingMessage){
    this.loading = await this.loadingCtrl.create({
      message: loadingMessage
    });
    await this.loading.present();
  }

  deleteFriends(idxItem){
    if (idxItem > -1) {
      this.presentLoading("Menghapus teman...").then(() => {
        this.userFriends.splice(idxItem, 1);
        this.userData.friends = this.userFriends;
        this.userService.update(this.idUser, this.userData);
        this.loading.dismiss();
      });
    }
  }

  filterFriendList(){
    this.userFriendsDataFilter = this.userFriendsData.filter(user => {
      return user.fullname.toLowerCase().includes(this.searchValue.toLowerCase());
    })
  }

  searchUser(){
    if(this.userFriendsDataFilter){
      if(this.searchValue == ''){
        this.userFriendsDataFilter = this.userFriendsData;
      }
      else{
        this.filterFriendList();
      }
    }
  }

  onPress(idxItem, userFullname){
    this.presentAlert(idxItem, userFullname);
  }

  imageLoaded(event){
    var target = event.target || event.srcElement || event.currentTarget;
    var idAttr = target.attributes.id;
    var idValue = idAttr.nodeValue;
    var profileWidth = document.getElementById(idValue).offsetWidth;
    document.getElementById(idValue).style.height = profileWidth + "px";
  }
}
