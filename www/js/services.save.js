/**
 * Twitter library written to work with Cordova.
 *
 * This was specifically written to work with IonicFramework & AngularJS
 *
 * The code is based on the OpenFB Library which can be found here
 *    https://github.com/ccoenraets/sociogram-angular-ionic
 *
 * And the Twitter Library that can be found here
 *
 *
 * @author Aaron Saunders @aaronksaunders
 * @version 0.1
 */
angular.module('twitterLib', [])

    .factory('TwitterLib', function ($rootScope, $q, $window, $http) {

        // GLOBAL VARS

        var runningInCordova = false;
        var loginWindow;


        // Construct the callback URL
        var index = document.location.href.indexOf('index.html');
        var callbackURL = document.location.href.substring(0, index) + 'oauthcallback.html';

        var oauth;
        var requestParams;


        // YOUR Twitter CONSUMER_KEY, Twitter CONSUMER_SECRET
        var options = {
            consumerKey: 'PU47tNh833f96TZ1OlrspA',
            consumerSecret: '7kx4gVW1UBIEeSOgwGm6jdNNqq27gl5kYCfkWAC6XW4',
            callbackUrl: callbackURL
        };
        // YOU have to replace it on one more Place                   
        var twitterKey = "TWITTER.SAMPLE.KEY"; // This key is used for storing Information related


        // used to check if we are running in phonegap/cordova
        $window.document.addEventListener("deviceready", function () {
            runningInCordova = true;
        }, false);

        var Twitter = {
            init: function () {

                var deferredLogin = $q.defer();

                /**
                 *  the event handler for processing load events for the oauth
                 *  process
                 *
                 * @param event
                 */
                var doLoadstart = function (event) {
                    var url = event.url;
                    Twitter.success(url, deferredLogin);
                };

                /**
                 *  the event handler for processing exit events for the oauth
                 *  process
                 *
                 * @param event
                 */
                var doExit = function (event) {
                    // Handle the situation where the user closes the login window manually
                    // before completing the login process
                    console.log(JSON.stringify(event));
                    deferredLogin.reject({error: 'user_cancelled',
                        error_description: 'User cancelled login process',
                        error_reason: "user_cancelled"
                    });
                };

                // Apps storedAccessData , Apps Data in Raw format
                var storedAccessData, rawData = localStorage.getItem(twitterKey);
                // here we are going to check whether the data about user is already with us.
                if (localStorage.getItem(twitterKey) !== null) {
                    storedAccessData = JSON.parse(rawData);

                    options.accessTokenKey = storedAccessData.accessTokenKey;
                    options.accessTokenSecret = storedAccessData.accessTokenSecret;

                    // javascript OAuth take care of everything for app we need to provide just the options
                    oauth = OAuth(options);
                    oauth.get('https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true',
                        function (data) {
                            var userInformation = JSON.parse(data.text);
                            console.log("TWITTER USER: " + userInformation.screen_name);
                            deferredLogin.resolve(userInformation);
                        },
                        function (error) {
                            var errorString = "ERROR - verify_credentials from local storage: ";
                            console.log(errorString + JSON.stringify(error));
                            deferredLogin.reject({
                                error: errorString,
                                error_description: error
                            });
                        }
                    );
                } else {
                    // we have no data for save user
                    oauth = OAuth(options);
                    oauth.get('https://api.twitter.com/oauth/request_token',
                        function (data) {
                            requestParams = data.text;

                            loginWindow = $window.open('https://api.twitter.com/oauth/authorize?' + data.text, '_blank', 'location=no');

                            if (runningInCordova) {
                                loginWindow.addEventListener('loadstart', doLoadstart);
                            } else {
                                // this saves the promise value in the window when running in the browser
                                window.deferredLogin = deferredLogin;
                            }


                        },
                        function (error) {
                            console.log("ERROR: " + JSON.stringify(error));
                            deferredLogin.reject({error: 'user_cancelled', error_description: error });
                        }
                    );
                }

                return deferredLogin.promise;
            },
            /**
             *  When inAppBrowser's URL changes we will track it here.
             *  We will also be acknowledged was the request is a successful or unsuccessful
             *
             @param _url url received from the event
             @param _deferred promise associated with login process
             */
            success: function (_url, _deferred) {


                // this gets the promise value from the window when running in the browser
                _deferred = _deferred || window.deferredLogin;

                // Here the URL of supplied callback will Load
                /* Here Plugin will check whether the callback Url matches with the given Url */
                if (_url.indexOf(callbackURL + "?") >= 0) {

                    loginWindow.close();

                    // Parse the returned URL
                    var params, verifier = '';
                    params = _url.substr(_url.indexOf('?') + 1);

                    params = params.split('&');
                    for (var i = 0; i < params.length; i++) {
                        var y = params[i].split('=');
                        if (y[0] === 'oauth_verifier') {
                            verifier = y[1];
                        }
                    }

                    /*
                     Once user has authorised us then we have to change the token for request with token of access
                     here we will give data to localStorage.
                     */
                    oauth.get('https://api.twitter.com/oauth/access_token?oauth_verifier=' + verifier + '&' + requestParams,
                        function (data) {
                            var accessParams = {};

                            accessParams = oauth.parseTokenRequest(data);

                            oauth.setAccessToken([accessParams.oauth_token, accessParams.oauth_token_secret]);

                            // Saving token of access in Local_Storage
                            var accessData = {};
                            accessData.accessTokenKey = accessParams.oauth_token;
                            accessData.accessTokenSecret = accessParams.oauth_token_secret;

                            // Configuring Apps LOCAL_STORAGE
                            console.log("TWITTER: Storing token key/secret in localStorage");
                            $window.localStorage.setItem(twitterKey, JSON.stringify(accessData));

                            oauth.get('https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true',
                                function (data) {
                                    var userInformation = JSON.parse(data.text);
                                    console.log("TWITTER USER: " + userInformation.screen_name);
                                    _deferred.resolve(userInformation);
                                },
                                function (error) {
                                    var errorString = "ERROR - verify_credentials: ";
                                    console.log(errorString + JSON.stringify(error));
                                    deferredLogin.reject({error: errorString, error_description: error });
                                }
                            );
                        },
                        function (data) {
                            console.log("ERROR - oauth_verifier: " + JSON.stringify(data));
                            _deferred.reject({error: 'user_cancelled', error_description: data });
                            loginWindow.close();
                        }
                    );
                }
                else {
                    // Just Empty
                }
            },
            /**
             * this will verify the user and store the credentials
             *
             */
            verify: function () {
                var deferred = $q.defer();
                var storedAccessData, rawData = localStorage.getItem(twitterKey);

                storedAccessData = JSON.parse(rawData);
                options.accessTokenKey = storedAccessData.accessTokenKey; // it will be saved on first signin
                options.accessTokenSecret = storedAccessData.accessTokenSecret; // it will be save on first login

                // javascript OAuth will care of else for app we need to send only the options
                oauth = OAuth(options);
                oauth.get('https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true',
                    function (data) {
                        console.log("in verify resolved " + data.text);
                        deferred.resolve(JSON.parse(data.text));
                    }, function (_error) {
                        console.log("in verify reject " + _error);
                        deferred.reject(JSON.parse(_error));
                    }
                );
                return deferred.promise;
            },
            /**
             * this will use the tokens stored to send a tweet
             *
             * @param _message
             */
            tweet: function (_message) {

                var deferred = $q.defer();
                return deferred.promise
                    .then(Twitter.verify().then(function () {
                        console.log("in tweet verified success");
                        return Twitter.apiPostCall({
                            url: 'https://api.twitter.com/1.1/statuses/update.json',
                            params: {
                                'status': _message,
                                'trim_user': 'true'
                            }
                        });
                    }, function (_error) {
                        deferred.reject(JSON.parse(_error.text));
                        console.log("in tweet " + _error.text);
                    })
                );
            },
            /**
             * uses oAuth library to make a GET call
             *
             * @param _options.url
             * @param _options.params
             */
            apiGetCall: function (_options) {
                var deferred = $q.defer();

                // javascript OAuth will care of else for app we need to send only the options
                oauth = OAuth(options);
                var _reqOptions = _options;
                _reqOptions.method = "GET";
                _reqOptions.success = function (data) {
                    deferred.resolve(JSON.parse(data.text));
                };
                _reqOptions.failure = function (error) {
                    deferred.reject(JSON.parse(error.text));
                };

                oauth.request(_reqOptions);
                return deferred.promise;
            },
            /**
             * uses oAuth library to make a POST call
             *
             * @param _options.url
             * @param _options.params
             */
            apiPostCall: function (_options) {
                var deferred = $q.defer();

                oauth = OAuth(options);

                oauth.post(_options.url, _options.params,
                    function (data) {
                        deferred.resolve(JSON.parse(data.text));
                    },
                    function (error) {
                        deferred.reject(JSON.parse(error.text));
                        console.log("in apiPostCall reject " + error.text);
                    }
                );
                return deferred.promise;
            },
            /**
             * clear out the tokens stored in local storage
             */
            logOut: function () {
                window.localStorage.removeItem(twitterKey);
                options.accessTokenKey = null;
                options.accessTokenSecret = null;
                console.log("Please authenticate to use this app");
            }

        };

        return Twitter;

    });

/**
 * @see oauthcallback.html for additional information
 *
 * @param url
 */
function oauthCallback(url) {
    var injector = angular.element(document.getElementById('main')).injector();
    injector.invoke(function (TwitterLib) {
        TwitterLib.success(url, false);
    });
}