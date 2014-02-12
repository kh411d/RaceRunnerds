'use strict';

/* Controllers */

var runnerdControllers = angular.module('runnerdControllers',[]);

runnerdControllers.controller('HeartrateCtrl',['$scope','$timeout',function($scope,$timeout){
  //Set Stopwatch
    var data = { 
            value: 0,
            bpm: 0
        },
    	stopwatch = null;
    $scope.counting = false;	
    $scope.showcounter = true;
    $scope.showhowto = false;
    $scope.showwiki = false;

    $scope.toggle = function(item) {
    	if(item == "counter"){
			$scope.showcounter = true;
    		$scope.showhowto = false;
    		$scope.showwiki = false;
    	}
    	if(item == "howto"){
    		$scope.showcounter = false;
    		$scope.showhowto = true;
    		$scope.showwiki = false;
    	}
    	if(item == "wiki"){
    		$scope.showcounter = false;
    		$scope.showhowto = false;
    		$scope.showwiki = true;
    	}
    }
        
    $scope.start = function () {
    	$scope.counting = true;
    	$scope.bpm = 0;
		stopwatch = $timeout(function() {
            data.value++;	
            $scope.start();

        }, 1000);
    };

    $scope.stop = function () {
    	$scope.counting = false;
    	data.bpm = Math.floor((10/(data.value+1))*60);

        $timeout.cancel(stopwatch);

        stopwatch = null;
        $scope.bpm = data.bpm;
        data.value = 0;
    };

    $scope.bpm = data.bpm;

}]);

runnerdControllers.controller('SimraceCtrl',['$scope','$http','localStorageService','$timeout','Facebook',function($scope,$http,localStorageService,$timeout,Facebook){

//Getting TrackPoint from GPX file
    var points = [];
    var marker;
    var simulator = [];
    var bounds = new google.maps.LatLngBounds ();
    var map;
    var eol;
    var poly;
    
    $scope.is_animate = false;


    $http.get('contents/track.gpx').success(function(data) {   	
		$(data).find("trkpt").each(function() {
		  var lat = $(this).attr("lat");
		  var lon = $(this).attr("lon");
		  var p = new google.maps.LatLng(lat, lon);
		  points.push(p);
		  bounds.extend(p);       	 
		});


		var latlng = points[0];
   		 
			  var start_latlng = points[0];
			  var finish_latlng = points[points.length - 1];

	    var myOptions = {
				    zoom: 15,
				    center: latlng,
				    mapTypeControl: false,
				    navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
				    mapTypeId: google.maps.MapTypeId.ROADMAP
				  };

	  	map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);

	  	//Track point
	   poly = new google.maps.Polyline({
				  path: points,
				  strokeColor: "#FF00AA",
				  strokeOpacity: .7,
				  strokeWeight: 4
				});
				
	   poly.setMap(map);

	   eol = poly.Distance();

		// fit bounds to track
		map.fitBounds(bounds);


    }); 

	function animate(d,marker,tick) {
			  	if (d>eol || !$scope.is_animate) {
			  		marker.setMap(null);
		          return;
		        }
		        var p = poly.GetPointAtDistance(d);
		        marker.setPosition(p);
		        d = d + 10;
		        $timeout(function() {
	              animate(d,marker,tick);
	            }, tick)
	}

	$scope.stop = function(){
		$scope.is_animate = false;
	}	
	
	$scope.simulate = function(){
		
		var max_runners = 2;
		var runners = new Array();
		var temp = [];
		$scope.is_animate = false;
		
		marker = new google.maps.Marker({
										      position: points[0], 
										      map: map, 
										      title:"f0",
										      icon:"http://maps.google.com/mapfiles/marker.png"
										});

		runners['f0'] = { 'val' : 1300, 'marker' : marker };
		var icon = [];
		icon['f1'] = 'http://maps.google.com/mapfiles/marker_purple.png';
		icon['f2'] = 'http://maps.google.com/mapfiles/marker_yellow.png'; 

		for (var i = 1; i <= max_runners; i++){
			if($('#f'+i).val()){
				marker = new google.maps.Marker({
										      position: points[0], 
										      map: map, 
										      title:"f"+i,
										      icon : icon["f"+i]
										  })
				runners['f'+i] = { 
								  'val' : $('#f'+i).val(),
								  'marker' : marker
								 };
			}
		}
		
		//Sort runners to get Min val (in seconds)
		Object.keys( runners ).sort(function( a, b ) {
		    return runners[a].val - runners[b].val;
		}).forEach(function( key ) { 
		    temp.push(key);
		});
		//Get small time ratio for the fastest runner to 100 millisecs tick
		var dividen = Math.floor(runners[temp[0]].val/100);
		var animate_time=0;

		$scope.is_animate = true;
		for (var runner in runners) {
			var tick = Math.floor((runners[runner].val/runners[temp[0]].val)*100);
			animate_time = animate_time + tick;
			animate(0,runners[runner].marker,tick);
		}	
		
		
		//Total animate time
		/*$timeout(function() {
	              $scope.is_animate = false;
	            }, animate_time*50)*/
	}


}]);

runnerdControllers.controller('MeetpointCtrl',['$scope','$http','localStorageService','$timeout','Facebook',function($scope,$http,localStorageService,$timeout,Facebook){

	var markersArray = [];
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

    $scope.showhowto = false;
    $scope.showmap = true;

    $scope.toggle = function(item) {
    	if(item == "map"){
			$scope.showhowto = false;
    		$scope.showmap = true;
    	}
    	if(item == "howto"){
    		$scope.showhowto = true;
    		$scope.showmap = false;
    	}
    }

	        //Try GeoLocation support
	if (navigator.geolocation) {

	  	navigator.geolocation.getCurrentPosition(


		  	function(position) {
			 
			  var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				

	            var myOptions = {
			    zoom: 18,
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

			  var eol = poly.Distance();

				// fit bounds to track
				map.fitBounds(bounds);


	            // add a click event handler to the map object
	            google.maps.event.addListener(map, "click", function(event)
	            {
	                // place a marker
	                placeMarker(event.latLng);
	            });

	            placeMarker(latlng);

	            function placeMarker(location) {
		            // first remove all markers if there are any
		            deleteOverlays();

		            var marker = new google.maps.Marker({
		                position: location, 
		                map: map
		            });

		            // add marker in markers array
		            markersArray.push(marker);

		            map.setCenter(location);
		            $('#status').html("<input type='text' class='topcoat-text-input--large full' value='Hi! Please check our meet point at https://maps.google.com/maps?saddr="+location.lat()+","+location.lng()+"'/>");
		            
		        }

		        // Deletes all markers in the array by removing references to them
		        function deleteOverlays() {
		            if (markersArray) {
		                for (var i in markersArray) {
		                    markersArray[i].setMap(null);
		                }
		            markersArray.length = 0;
		            }
		        }

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

runnerdControllers.controller('RunCtrl',['$scope','$http','localStorageService','$timeout','Facebook',function($scope,$http,localStorageService,$timeout,Facebook){
   

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

    $scope.showmap = true;
    $scope.showticker = false;
    $scope.isrunning = false;

    $scope.toggle = function(item){
    	if(item == 'map'){
    		$scope.showmap = true;
    		$scope.showticker = false;
    	}
    	if(item == 'ticker'){
    		$scope.showmap = false;
    		$scope.showticker = true;
    	}
    };
	  
    
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

    	/*if(!localStorageService.get('trackTime')){
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
				        alert('published');
				      }else{
				      	console.log(response);
				      	alert('not published');
				      }
				    }
				);

			});

    	}*/


    	
    	localStorageService.remove('pauseAt');

    	localStorageService.add('isRunning',true);
    	$scope.isrunning = true;
    	
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
        $scope.isrunning = false;
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
        $scope.isrunning = false;
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

    	$scope.isrunning = false;
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
			 
			  var start_latlng = points[0];
			  var finish_latlng = points[points.length - 1];

			  //Check distance position with start and race coordinates
			  var distance_to_start = Math.round(google.maps.geometry.spherical.computeDistanceBetween(latlng, start_latlng));
			  var distance_to_finish = Math.round(google.maps.geometry.spherical.computeDistanceBetween(latlng, finish_latlng));

			  var distance_to_start_text = distance_to_start > 1000 ? Math.floor(distance_to_start/1000)+"km" : distance_to_start+"m";
			  var distance_to_finish_text = distance_to_finish > 1000 ? Math.floor(distance_to_finish/1000)+"km" : distance_to_finish+"m";
			 
			  var s = document.querySelector('#status');
			  s.innerHTML = "You are apprx. <b>"+distance_to_start_text+"</b> from START point and <b>"+distance_to_finish_text+"</b> from FINISH point";
			  
			  
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

			  var eol = poly.Distance();

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


			  $scope.animate = function(d) {

			  	if (d>eol) {
			  	  start_marker.setPosition(start_latlng);
		          return;
		        }
		        var p = poly.GetPointAtDistance(d);
		        
		        map.panTo(p);
		        
		        start_marker.setPosition(p);
		        d = d + 10;
		        $timeout(function() {
	              $scope.animate(d);
	            }, 100)
		      }

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

