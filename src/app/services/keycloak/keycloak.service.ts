import {Inject, Injectable} from '@angular/core';
import {RequestOptionsArgs} from '@angular/http';
import {environment} from '../../../environments/environment';
import {APP_BASE_HREF} from '@angular/common';

declare var Keycloak: any;

@Injectable()
export class KeycloakService {

  private static auth: any = {};

  constructor(@Inject(APP_BASE_HREF) private baseHref: string) {
  }


  /**
   * Keycloak initialization method.
   *
   * @returns {Promise}
   */
  static init(): Promise<any> {

    const keycloakAuth: any = new Keycloak(
      {
        'realm': environment.keycloak.realm,
        'url': environment.keycloak.url,
        'clientId': environment.keycloak.resource,
        'ssl-required': 'none',
        'public-client': true
      }
    );
    KeycloakService.auth.loggedIn = false;

    return new Promise((resolve, reject) => {
      keycloakAuth.init({onLoad: 'login-required'})
        .success(() => {
          KeycloakService.auth.loggedIn = true;
          KeycloakService.auth.authz = keycloakAuth;
          resolve();
        })
        .error(() => {
          reject();
        });
    });
  }

  /**
   * Method for performing login.
   */
  login(): void {
    KeycloakService.auth.authz.login({redirectUri: window.location.href})
      .success(() => KeycloakService.auth.loggedIn = true);
  }

  /**
   * Method for performing logout.
   */
  logout() {
    KeycloakService.auth.authz.logout({redirectUri: window.location.origin + this.baseHref});
    KeycloakService.auth.loggedIn = false;
    KeycloakService.auth.authz = null;
  }

  /**
   * Method for retrieving token. An update may be required if token has expired.
   *
   * @returns {Promise<string>}
   */
  getToken(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (KeycloakService.auth.authz.token) {
        KeycloakService.auth.authz.updateToken(5)
          .success(() => {
            resolve(<string>KeycloakService.auth.authz.token);
          })
          .error(() => {
            this.login();
            reject('Failed to refresh token');
          });
      }
    });
  }

  /**
   * A method for retrieving user information from token. An update may be required if token has expired.
   *
   * @returns {Promise<any>}
   */
  getTokenParsed(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (KeycloakService.auth.authz.token) {
        KeycloakService.auth.authz.updateToken(5)
          .success(() => {
            resolve(KeycloakService.auth.authz.tokenParsed);
          })
          .error(() => {
            this.login();
            reject('Failed to refresh token');
          });
      }
    });
  }

  /**
   * Method for checking if user is logged in.
   *
   * @returns {boolean}
   */
  isLoggedIn(): boolean {
    return KeycloakService.auth != null && KeycloakService.auth.loggedIn;
  }

  /**
   * A method for retrieving user roles from token. An update may be required if token has expired.
   *
   * @returns {Promise<any>}
   */
  getUserRoles(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getTokenParsed().then(
        r => resolve(r.realm_access.roles)
      );
    });
  }

  /**
   * Method for retrieving token and packing it as Headers. An update may be required if token has expired.
   *
   * @returns {Promise<RequestOptionsArgs>}
   */
  getHeaders(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getToken().then(
        r => {
          return resolve({'Authorization': `Bearer ${r}`});
        }
      );
    });
  }
}
