import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-app';
  user = '';
  isLoggedIn = false;
  constructor(private socket: Socket) {

  }
  ngOnInit() {
    this.socket.on('message', (socketData) => {
      console.log(socketData, 'message');
    });
    this.socket.on('broadcast', (socketData) => {
      console.log(socketData, 'broadcast');
    });
    this.socket.on('joinroommessage', (socketData) => {
      console.log(socketData, 'joinroommessage');
    });
    this.socket.on('leaveroommessage', (socketData) => {
      console.log(socketData, 'leaveroommessage');
    });
    this.socket.on('loginuser', (socketData) => {
      console.log(socketData, 'loginuser');
    });
    this.isLoggedIn = localStorage.getItem('user') !== null && localStorage.getItem('user') !== undefined;
  }

  signIn() {
    localStorage.setItem('user', this.user);
    this.isLoggedIn = true;
    this.socket.emit('joinroom', {user: this.user});
  }

  signOut() {
    localStorage.clear();
    this.socket.emit('leaveroom', {user: this.user});
    this.isLoggedIn = false;
    this.user = '';
  }

  testSocket() {
    this.socket.emit('testsocket', {randomNumber: Math.random(), user: this.user});
  }

  broadcast() {
    this.socket.emit('broadcast', {randomNumber: Math.random(), user: this.user});
  }
}
