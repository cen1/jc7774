import { Component } from '@angular/core';
import { KeycloakService } from './services/keycloak/keycloak.service';
import { LocationStrategy } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  isPopState = false;

  constructor(private keycloakService: KeycloakService, private router: Router,
    private locationStrategy: LocationStrategy) {}

  title = 'kc7774';

  ngOnInit(): void {
    this.locationStrategy.onPopState(() => {
      this.isPopState = true;
    });

    this.router.events.subscribe(event => {
      // Scroll to top if accessing a page, not via browser history stack
      if (event instanceof NavigationEnd && !this.isPopState) {
        window.scrollTo(0, 0);
        this.isPopState = false;
      }

      // Ensures that isPopState is reset
      if (event instanceof NavigationEnd) {
        this.isPopState = false;
      }
    });
  }

  isActive(path: string): boolean {
    return this.router.url.indexOf(`/${path}`) >= 0;
  }

  logout(): void {
    this.keycloakService.logout();
  }
}
