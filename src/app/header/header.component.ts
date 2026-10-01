import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataStorageService } from '../shared/data-storage.service';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  collapsed = true;
  isAuthenticated = false;
  isAdmin = false;
  userEmail = '';
  private authSub: Subscription;

  constructor(
    private dataStorageService: DataStorageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authSub = this.authService.user.subscribe((user) => {
      this.isAuthenticated = !!user;
      this.isAdmin = user ? user.isAdmin : false;
      this.userEmail = user ? user.email : '';
    });
  }

  get userInitial(): string {
    return this.userEmail ? this.userEmail.charAt(0) : '?';
  }

  get roleLabel(): string {
    return this.isAdmin ? 'Admin' : 'View only';
  }

  onSaveData() {
    this.dataStorageService.storeRecipes();
  }

  onFetchData() {
    this.dataStorageService.fetchRecipes().subscribe();
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }
}
