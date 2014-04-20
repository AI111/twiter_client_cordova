// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'twitterLib'])

    .controller('MyCtrl', function ($scope, TwitterLib) {
        /**
         *
         */
        $scope.doLogin = function () {
            TwitterLib.init().then(function (_data) {
                alert(JSON.stringify(_data));
            }, function error(_error) {
                alert(JSON.stringify(_error));
            });
        };
        /**
         *
         */
        $scope.doLogout = function () {
            TwitterLib.logOut();
        };
        /**
         *
         */
        $scope.doStatus = function () {
            var options = {
                url: "https://api.twitter.com/1.1/statuses/user_timeline.json",
                data: {
                    'screen_name': "aaronksaunders",
                    'count': "25"
                }
            };
            TwitterLib.apiGetCall(options).then(function (_data) {
                alert("doStatus success");
                $scope.items = _data;

            }, function (_error) {
                alert("doStatus error" + JSON.stringify(_error));
            });
        };
        /**
         *
         */
        $scope.doTweet = function () {
            TwitterLib.tweet("Sample tweet " + new Date()).then(function (_data) {
                alert("tweet success");

            }, function (_error) {
                alert("tweet error" + JSON.stringify(_error));
            });
        };
    })
    .run(function ($ionicPlatform, TwitterLib) {
        $ionicPlatform.ready(function () {
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

        });
    });

//
// HERE ARE THE CONFIGURATION SETTINGS FOR OAUTH
// REPLACE  THESE VALUES WITH YOUR KEYS FROM TWITTER
//
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