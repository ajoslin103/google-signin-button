import { inject, noView, bindable } from 'aurelia-framework';

import { LogManager } from 'aurelia-framework';
const Console = LogManager.getLogger('google-signin-button');

// Integrating Google Sign-In into your web app
// https://developers.google.com/identity/sign-in/web/reference
// https://console.developers.google.com/apis/credentials

// inspiration: https://developers.google.com/identity/sign-in/web/build-button
function preparePlatform(): Promise<Function> {
  // Inject an async script element to load the google platform API.
  const script = document.createElement('script');
  script.src = `https://apis.google.com/js/platform.js?onload=gapi_ready`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
  // return a promise that will resolve with the onload callback
  return new Promise(resolve => window['gapi_ready'] = resolve);
}

@noView
@inject(Element)
export class GoogleSigninButton {

  @bindable authenticated = (signedIn: Boolean) => { };
  @bindable authorized = (GoogleUser: any) => { };

  @bindable scope = 'profile email';
  @bindable clientId = 'none';

  @bindable theme = 'dark';
  @bindable width = 240;
  @bindable height = 50;

  @bindable message = '';

  public element: Element;

  constructor(element) {
    this.element = element;
  }

  public wasAuthenticated: Boolean;
  sendAuthenticated(signedIn: Boolean) {
    if (signedIn !== this.wasAuthenticated) {
      this.authenticated(signedIn);
      this.wasAuthenticated = signedIn;
    }
  }

  public wasAuthorized: any;
  sendAuthorized(googleUser: any) {
    if (googleUser !== this.wasAuthorized) {
      this.authorized(googleUser);
      this.wasAuthorized = googleUser;
      this.sendAuthenticated(true);
    }
  }

  attached() {
    // inject the script tag
    preparePlatform()
      .then(() => {
        // load the auth lib
        // Console.debug('gapi created, loading auth2');
        window['gapi'].load('auth2', () => {
          // init the auth lib
          // Console.debug('gapi.auth2 loaded, intializing with clientId:', this.clientId);
          window['gapi'].auth2.init({
            client_id: this.clientId
          })
            .then(
              (googleAuth: any) => {
                // Console.debug('gapi.auth2 intialized');
                // listen for user signed in/out
                googleAuth.isSignedIn.listen((signedIn: Boolean) => {
                  // Console.debug('googleAuth.isSignedIn.listener', signedIn);
                  this.sendAuthenticated(signedIn);
                });
                // listen for who signed in
                googleAuth.currentUser.listen((googleUser: any) => {
                  // Console.debug('googleAuth.currentUser.listener', googleUser);
                  this.sendAuthorized(googleUser);
                });
                // draw the button
                this.message = 'In order to proceed you must:';
                window['gapi'].signin2.render(this.element, {
                  scope: this.scope,
                  width: this.width,
                  height: this.height,
                  longtitle: true,
                  theme: this.theme,
                  onsuccess: (googleUser: any) => {
                    // Console.debug('gapi.signin2.render success', googleUser);
                    this.sendAuthorized(googleUser);
                  },
                  // drawing button failure
                  onfailure: (error: any) => {
                    Console.error('gapi.signin2.render failure', error);
                  }
                });
              },
              // intialization error
              (errObj: any) => {
                Console.error('gapi.auth2.init -> errObj', errObj);
              }
            );
        });
      });
  }
}
