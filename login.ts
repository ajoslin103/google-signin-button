import environment from '../environment';

import { LogManager } from 'aurelia-framework';
const Console = LogManager.getLogger('Login');

import { inject } from 'aurelia-framework';
import { AuthService } from 'aurelia-authentication';
import { EventAggregator } from 'aurelia-event-aggregator';

import './login.scss';

@inject(AuthService, EventAggregator)
export class Login {

  public authService: AuthService;
  public eventAggregator: EventAggregator;

  public message: string = '';

  public googleSigninClientID: string = 'none';

  constructor(authService: AuthService, eventAggregator: EventAggregator) {
    this.eventAggregator = eventAggregator;
    this.authService = authService;

    this.googleSigninClientID = environment['googleSigninClientID'];
  };

  isAuthenticated = (signedIn: Boolean) => {
    Console.warn('isAuthenticated', signedIn);
    this.eventAggregator.publish('authentication-change', signedIn);
  }

  isAuthorized = (googleUser: any) => {
    Console.warn('isAuthorized', googleUser);
    this.eventAggregator.publish('authorization-change', googleUser);
  }

}
