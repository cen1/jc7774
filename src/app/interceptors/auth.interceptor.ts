/**
 * @author Sunesis ltd.
 * @since 1.0.0
 */
import {Inject, Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {fromPromise} from "rxjs/observable/fromPromise";
import {KeycloakService} from "../services/keycloak/keycloak.service";
import "rxjs/add/operator/mergeMap";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private keycloakService: KeycloakService,
              @Inject('PaymentApiUrl') private paymentApiUrl: string,
              @Inject('CartApiUrl') private cartApiUrl: string) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // KeyCloak token for payment API and cart API
    if (request.url.indexOf(this.paymentApiUrl) === 0 || request.url.indexOf(this.cartApiUrl) === 0) {
      return fromPromise(this.keycloakService.getToken()).mergeMap(token => {

        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

        return next.handle(request);
      });
    }
    // No auth for other (product catalogue API)
    else {
      return next.handle(request);
    }
  }
}
