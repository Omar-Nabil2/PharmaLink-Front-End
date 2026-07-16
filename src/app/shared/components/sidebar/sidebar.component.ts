import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '@core/services/auth.service';

export interface SidebarItem {
  label: string;
  icon?: string;
  routerLink: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AvatarModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  @Input() items: SidebarItem[] = [];
  
  fullName = '';
  roleName = '';
  
  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.fullName = localStorage.getItem('fullName') || 'User';
      this.roleName = localStorage.getItem('roleName') || 'Guest';
    }
  }
}
