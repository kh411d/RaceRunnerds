'use strict';

/* Controllers */

var runnerdControllers = angular.module('runnerdControllers',[]);

runnerdControllers.controller('ConnectCtrl', ['$scope', 'Facebook','$timeout', function($scope, Facebook,$timeout) {

// Define user empty data :/
      $scope.user = {};
      
      // Defining user logged status
      $scope.logged = false;

      Facebook.getLoginStatus(function(response) {
          if (response.status == 'connected') {
            $scope.logged = true;
          }
        });

// Here, usually you should watch for when Facebook is ready and loaded
  $scope.$watch(function() {
    return Facebook.isReady(); // This is for convenience, to notify if Facebook is loaded and ready to go.
  }, function(newVal) {
    $scope.facebookReady = true; // You might want to use this to disable/show/hide buttons and else
  });

   $scope.login = function() {
         Facebook.login(function(response) {
          if (response.status == 'connected') {
            $scope.logged = true;
            $scope.me();
          }
        },{scope: 'email,user_likes,publish_stream'});
    };


  $scope.IntentLogin = function() {
        Facebook.getLoginStatus(function(response) {
          if (response.status == 'connected') {
            $scope.logged = true;
            $scope.me(); 
          }
          else
            $scope.login();
        });
   };

  $scope.getLoginStatus = function() {
    Facebook.getLoginStatus(function(response) {
      if(response.status == 'connected') {
        $scope.$apply(function() {
          $scope.loggedIn = true;
        });
      }
      else {
        $scope.$apply(function() {
          $scope.loggedIn = false;
        });
      }
    });
  };

  /**
       * Taking approach of Events :D
       */
      $scope.$on('Facebook:statusChange', function(ev, data) {
        if (data.status == 'connected') {
          $scope.$apply(function() {
            $scope.salutation = true;
            $scope.byebye     = false;    
          });
        } else {
          $scope.$apply(function() {
            $scope.salutation = false;
            $scope.byebye     = true;
            
            // Dismiss byebye message after two seconds
            $timeout(function() {
              $scope.byebye = false;
            }, 2000)
          });
        }
        
        
      });

      /**
       * Logout
       */
      $scope.logout = function() {
        Facebook.logout(function() {
          $scope.$apply(function() {
            $scope.user   = {};
            $scope.logged = false;  
          });
        });
      };

    $scope.me = function() {
      Facebook.api('/me', function(response) {
        $scope.$apply(function() {
          // Here you could re-check for user status (just in case)
          $scope.user = response;
        });
      });
    };

}]);

runnerdControllers.controller('RunCtrl',['$scope','$http','localStorageService','$timeout','cfg_coords','Facebook',function($scope,$http,localStorageService,$timeout,cfg_coords,Facebook){
   
    //Getting page content
    $http.get('contents/start.json').success(function(data) {
      $scope.contents = data;
    });

	Facebook.getLoginStatus(function(response) {
      if(response.status == 'connected') {
        Facebook.api('/me', function(response) {
	    $scope.$apply(function() {
	      // Here you could re-check for user status (just in case)
	      $scope.user = response;
	    });
	  });
      }
    });
	  
    
    //Set Stopwatch
    var data = { 
            value: 0,
            hour: 0,
            min : 0,
            sec : 0,
            text : "00 : 00 : 00",
            laps: []
        },
    	stopwatch = null;
        
    $scope.start = function () {

    	if(!localStorageService.get('trackTime')){
	    	Facebook.getLoginStatus(function(response) {  
			  Facebook.api(
				    "/me/feed",
				    "post",
				    {
					    name: 'Facebook Dialogs',
					    link: 'https://developers.facebook.com/docs/dialogs/',
					    picture: 'http://fbrell.com/f8.jpg',
					    caption: 'Reference Documentation',
					    description: 'Dialogs provide a simple, consistent interface for applications to interface with users.'
					},
				    function (response) {
				      if (response && !response.error) {
				        /* handle the result */
				        alert('published');
				      }else{
				      	console.log(response);
				      	alert('not published');
				      }
				    }
				);

			});

    	}


    	
    	localStorageService.remove('pauseAt');

    	localStorageService.add('isRunning',true);
    	
		stopwatch = $timeout(function() {


            data.value++;

            data.sec = data.value;
            
            if (data.value == 60) {
			   data.sec = 0;
			   data.value = data.sec;
			   data.min++; 
			} else {
			   data.min = data.min; 
			}
			
			if (data.min == 60) {
			   data.min = 0;
			   data.hour++; 
			}

			data.text = (data.hour <= 9 ? "0"+data.hour : data.hour)+" : "+
						(data.min <= 9 ? "0"+data.min : data.min)+" : "+
						(data.sec <= 9 ? "0"+data.sec : data.sec);
			
			var trackTime = new Date();			
			localStorageService.add('trackTime',{
				"time" : (data.hour*3600)+(data.min*60)+(data.sec),
				"lastUpdate" : trackTime.getTime()/1000
			});			
            
            $scope.start();
        }, 1000);
    };

     $scope.stop = function () {
        $timeout.cancel(stopwatch);
        stopwatch = null;
        localStorageService.add('isRunning',false);
        localStorageService.add('pauseAt',new Date());
    };

     $scope.reset = function () {
       $timeout.cancel(stopwatch);
        stopwatch = null;
        data.value = 0;
        data.hour = 0;
        data.min = 0;
        data.sec = 0;
        data.text = "00 : 00 : 00";
        data.laps = [];
        localStorageService.remove('pauseAt');
        localStorageService.remove('isRunning');
        localStorageService.remove('laps');
        localStorageService.remove('trackTime');

    };

    $scope.lap = function () {
        data.laps.push({
        	"hour":data.hour,
        	"min":data.min,
        	"sec":data.sec,
        	"text" : (data.hour <= 9 ? "0"+data.hour : data.hour)+" : "+
						(data.min <= 9 ? "0"+data.min : data.min)+" : "+
						(data.sec <= 9 ? "0"+data.sec : data.sec)
        });
        localStorageService.add('laps',data.laps);
    };

    $scope.end = function () {
    	
    	$timeout.cancel(stopwatch);
        stopwatch = null;
    	
    	localStorageService.add('runResult',{
    		"endAt" : localStorageService.get('trackTime'),
    		"time" : (data.hour*3600)+(data.min*60)+(data.sec),
    	});

    	localStorageService.remove('pauseAt');
        localStorageService.remove('isRunning');
        localStorageService.remove('laps');
        localStorageService.remove('trackTime');

    }

    $scope.stopwatch = data;

    //Check Offset and continue automatically 
    if(localStorageService.get('trackTime')) {

	    var oldTrackTime = localStorageService.get('trackTime');
	    var nowTime = new Date().getTime()/1000;
	    var offset = Math.floor(nowTime - oldTrackTime.lastUpdate);
	    
	    var sec_num = oldTrackTime.time + offset;
	    data.hour   = Math.floor(sec_num / 3600);
	    data.min = Math.floor((sec_num - (data.hour * 3600)) / 60);
	    data.sec = sec_num - (data.hour * 3600) - (data.min * 60);	
	    data.value = data.sec;
	    data.text = (data.hour <= 9 ? "0"+data.hour : data.hour)+" : "+
						(data.min <= 9 ? "0"+data.min : data.min)+" : "+
						(data.sec <= 9 ? "0"+data.sec : data.sec);   
		$scope.start();
	}

    //Getting TrackPoint from GPX file
    var points = [];
    var bounds = new google.maps.LatLngBounds ();
		
    $http.get('contents/track.gpx').success(function(data) {   	
		$(data).find("trkpt").each(function() {
		  var lat = $(this).attr("lat");
		  var lon = $(this).attr("lon");
		  var p = new google.maps.LatLng(lat, lon);
		  points.push(p);
		  bounds.extend(p);
		});
    });
    


    //Try GeoLocation support
	if (navigator.geolocation) {

	  	navigator.geolocation.getCurrentPosition(

		  	function(position) {
			  
			  var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			  
			  var start_latlng = new google.maps.LatLng(cfg_coords.start.lat, cfg_coords.start.lng);
			  var finish_latlng = new google.maps.LatLng(cfg_coords.finish.lat, cfg_coords.finish.lng);

			  //Check distance position with start and race coordinates
			  var distance_to_start = Math.round(google.maps.geometry.spherical.computeDistanceBetween(latlng, start_latlng));
			  var distance_to_finish = Math.round(google.maps.geometry.spherical.computeDistanceBetween(latlng, finish_latlng));

			 
			  var s = document.querySelector('#status');
			  s.innerHTML = "You are <b>"+distance_to_start+"m</b> from START point and <b>"+distance_to_finish+"m</b> from FINISH point";
			  
			  
			  var myOptions = {
			    zoom: 15,
			    center: latlng,
			    mapTypeControl: false,
			    navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
			    mapTypeId: google.maps.MapTypeId.ROADMAP
			  };

			  

			  var map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);

			  //Track point
			  var poly = new google.maps.Polyline({
						  path: points,
						  strokeColor: "#FF00AA",
						  strokeOpacity: .7,
						  strokeWeight: 4
						});
						
				  poly.setMap(map);
						
				// fit bounds to track
				map.fitBounds(bounds);
			  
			  var marker = new google.maps.Marker({
			      position: latlng, 
			      map: map, 
			      title:"You are here! (at least within a "+position.coords.accuracy+" meter radius)"
			  });

			  var start_marker = new google.maps.Marker({
			      position: start_latlng, 
			      map: map, 
			      title:"START POINT!"
			  });

			  var finish_marker = new google.maps.Marker({
			      position: finish_latlng, 
			      map: map, 
			      title:"FINISH POINT!"
			  });
			}, 

			function (error) {
			  var s = document.querySelector('#status');
 			    switch (error.code) {
	              	case 1:
	             	 s.innerHTML = 'You have rejected access to your location';             
	                break;
	              	case 2:
	                s.innerHTML = 'Unable to determine your location';
	                break;
	              	case 3:
	                s.innerHTML = 'Service timeout has been reached';
	                break;
	            }
			}
		);

	} else {
	  var s = document.querySelector('#status');
	  s.innerHTML = 'Browser does not support location services';
	}



}]);

