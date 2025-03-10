import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ToastController} from "@ionic/angular";
import {AuthService} from "../services/auth.service";
import {UserService} from "../services/user.service";
import { map } from 'rxjs/operators';

declare var google: any;
@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit {

  private lat: number;
  private lng: number;
  private map: any;
  private userMarker: any;
  private locationValue: string = "";
  private idUser: string;
  private userData: any;
  private usersData: any;
  private userFriendsData: any[] = [];
  private userFriends: any[] = [];
  private userLocations: any[] = [];
  private monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];
  @ViewChild('map', {read: ElementRef, static: false}) mapRef: ElementRef;
  initPos: any = {
    lat: -6.256081,
    lng: 106.618755
  }

  constructor(
      private toastCtrl: ToastController,
      private authService: AuthService,
      private userService: UserService
  ) { }

  ngOnInit() {
    this.getIdUser();
  }

  ionViewDidEnter(){
    this.initMap();
    if(this.userFriendsData.length > 0){
      this.markUserLocation();
    }
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
    this.markUserLocation();
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

  markUserLocation(){
    for(let idx = 0; idx < this.userFriendsData.length; idx++){
      if(this.userFriendsData[idx].locations){
        var eachFriendLocation = this.userFriendsData[idx].locations[this.userFriendsData[idx].locations.length-1];
        const location = new google.maps.LatLng(eachFriendLocation.lat, eachFriendLocation.lng);
        const marker = new google.maps.Marker({
          position: location,
          map: this.map,
          icon: 'assets/icon/marker.png',
          clickable: true
        });
        marker.info = new google.maps.InfoWindow({
          content: this.userFriendsData[idx].fullname
        });
        google.maps.event.addListener(marker, 'click', function() {
          marker.info.open(map, marker);
        });
      }
    }
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


  getCurrentLoc(){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position: Position) => {
        if(this.userMarker){
          this.userMarker.setMap(null);
        }

        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }

        this.lat = pos.lat;
        this.lng = pos.lng;

        this.userMarker = new google.maps.Marker({
          position: new google.maps.LatLng(this.lat, this.lng),
          map: this.map
        });

        this.map.setCenter(pos);
      });
    }
  }

  initMap(){
    const location = new google.maps.LatLng(this.initPos.lat, this.initPos.lng);
    const options = {
      center: location,
      zoom: 13,
      disableDefaultUI: true
    };
    this.map = new google.maps.Map(this.mapRef.nativeElement, options);

    this.map.addListener('click', (mapsMouseEvent) => {
      if(this.userMarker){
        this.userMarker.setMap(null);
      }

      this.lat = mapsMouseEvent.latLng.toJSON().lat;
      this.lng = mapsMouseEvent.latLng.toJSON().lng;

      this.userMarker = new google.maps.Marker({
        position: mapsMouseEvent.latLng,
        map: this.map
      });
    })
  }

  getCurrDate(){
    var today = new Date();
    var todayDay = String(today.getDate()).padStart(2, '0');
    var todayMonth = String(today.getMonth()).padStart(2, '0');
    var todayYear = today.getFullYear();
    var todayHour = today.getHours();
    var todayMinute = today.getMinutes();
    var todayDate = todayDay + ' ' + this.monthNames[todayMonth] + ' ' + todayYear + ' ' + todayHour + ':' + todayMinute;

    return todayDate;
  }

  checkIn(){
    var todayDate = this.getCurrDate();
    var newLocation: any = {
      lat: this.lat,
      lng: this.lng,
      nama: this.locationValue,
      tanggal: todayDate
    }
    this.userLocations.push(newLocation);
    this.userData.locations = this.userLocations;

    this.userService.update(this.idUser, this.userData);
    this.locationValue = "";
    this.hideModal();
    this.presentToast("Location successfully updated", "success");
  }

  openModal(){
    if(this.userMarker != null){
      document.getElementById('transparentLayer').classList.remove('ion-hide');
      document.getElementById('modalLayer').classList.remove('ion-hide');
      document.getElementById('fabCurLoc').classList.add('ion-hide');
      document.getElementById('fabOpenModal').classList.add('ion-hide');
    }
    else{
      this.presentToast("Choose the location first", "danger");
    }
  }

  hideModal(){
    document.getElementById('transparentLayer').classList.add('ion-hide');
    document.getElementById('modalLayer').classList.add('ion-hide');
    document.getElementById('fabCurLoc').classList.remove('ion-hide');
    document.getElementById('fabOpenModal').classList.remove('ion-hide');
  }
}
