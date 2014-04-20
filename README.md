Ionic/Angular App with Simple Twitter Integration
=====================

A starting project for Ionic that optionally supports
using custom SCSS.

## Using this project

This project is based on code from [jsOauth](https://github.com/bytespider/jsOAuth) and [ccoenraets/sociogram-angular-ionic](https://github.com/ccoenraets/sociogram-angular-ionic)

HERE ARE THE CONFIGURATION SETTINGS FOR OAUTH, REPLACE  THESE VALUES WITH YOUR KEYS FROM TWITTER

    angular.module('starter').constant('myAppConfig', {
        oauthSettings: {
            consumerKey: 'consumerKey',
            consumerSecret: 'consumerSecret',
            requestTokenUrl: 'https://api.twitter.com/oauth/request_token',
            authorizationUrl: "https://api.twitter.com/oauth/authorize",
            accessTokenUrl: "https://api.twitter.com/oauth/access_token",
            callbackUrl: "callbackUrl"
        }
    });

Be sure to add the inAppBrowser Plugin to your project

    cordova plugins add org.apache.cordova.inappbrowser