'use strict';

/* App Module */

var runnerdApp = angular.module('runnerdApp',['ngRoute','runnerdControllers','ngCookies','LocalStorageModule','facebook']);
  
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
    when('/heartrate',{
      templateUrl: 'partials/heartrate.html',
      controller: 'HeartrateCtrl'
    }).
    when('/simrace',{
      templateUrl: 'partials/simrace.html',
      controller: 'SimraceCtrl'
    }).
    when('/meetpoint',{
      templateUrl: 'partials/meetpoint.html',
      controller: 'MeetpointCtrl'
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

runnerdApp.factory('GpxService', function($http, $q) {

    var getData = function() {
        var deferred = $q.defer();

        $http({method:"GET", url:"contents/track.gpx"}).success(function(result){
            deferred.resolve(result);
        });

        return deferred.promise;
    }
});


