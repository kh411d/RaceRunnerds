'use strict';

/* App Module */

var runnerdApp = angular.module('runnerdApp',['ngRoute','runnerdControllers','ngCookies','LocalStorageModule','facebook'])
                        .constant('cfg_coords',{
                          "start"  : { "lat" : -6.24430, "lng" : 106.79410},
                          "finish" : { "lat" : -6.24467, "lng" : 106.79464}
                        });
  
runnerdApp.config(['$routeProvider','FacebookProvider',function($routeProvider,FacebookProvider){
  $routeProvider.
    when('/run',{
      templateUrl: 'partials/run.html',
      controller: 'RunCtrl'
    }).
    when('/connect',{
      templateUrl: 'partials/connect.html',
      controller: 'ConnectCtrl'
    }).
    when('/connect/:provider',{
      templateUrl: 'partials/connect-provider.html',
      controller: 'ConnectProviderCtrl'
    }).
    when('/wiki',{
      templateUrl: 'partials/wiki.html',
      controller: 'WikiCtrl'
    }).
    when('/wiki/:wikiId',{
      templateUrl: 'partials/wiki-detail.html',
      controller: 'WikiDetailCtrl'
    }).
    when('/policy',{
      templateUrl: 'partials/policy.html',
      controller: 'PolicyCtrl'
    }).
    when('/fbconnect',{
      controller: 'FbconnectCtrl'
    }).
    otherwise({
      redirectTo: '/run'
    });

    FacebookProvider.init('275500175941247');
}]);


