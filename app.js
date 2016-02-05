angular.module('caboodle',['ngRoute','mgcrea.ngStrap','ngAnimate']).config(function($routeProvider,$httpProvider){
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $routeProvider.when("/camap",{
        templateUrl : "views/camap.html",
        controller  : "caMap"
    })

    $routeProvider.otherwise('/camap');
});

angular.module('caboodle').controller('caMap',['$scope','$http','$modal',function($scope,$http,$modal){

    var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
    //var map_points = [{"Name":"WDS Groups","AccountID":1005061304539646,"Latitude":-26.251884124935,"Longitude":27.973657538468},{"Name":"Fasie Limited (Creative)","AccountID":1005061848543519,"Latitude":-29.825351959326,"Longitude":30.8310294509}];
    map_points = [];
    var map;
    var bounds = new google.maps.LatLngBounds();
    $scope.keys = [];
    function toggleNavigation() {
        $('.nav').toggleClass('nav-show');
        $('.nav').toggleClass('nav-hide');
        $('#nav-backbox').toggleClass('nav-backbox-hide ');
        $('#nav-backbox').toggleClass('nav-backbox-show ');
    }

    $("#nav-icon, #nav-backbox").click(function(){
        toggleNavigation()
    });

    function getData(Query,Success){
        $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode('CONVDUMMY:PASSWORD');
        var url = 'http://php.rapidtrade.biz/testrest/rapidapi/caboodle.php/Query?query='+Query;
        //map_points = []
        //addMarkers();
        console.log(Query);
        $http({method: 'GET', url: url, withCredentials: true, username: 'DEMO', password: 'DEMO'})
        .success(function(data){
            if(Success) Success(data);
        }).error(function(error){
            console.log(error);
        })
    }

    $scope.CustomerTotalPerRep = function(){
        getData('CustomerTotalPerRep',function(data){
            map_points = Cluster(data,'RepCode');
            addClusteredMarkers()
            console.log(map_points);
            toggleNavigation();
        });

        //map_points = []
        //addMarkers();
        initialize();
    }

    $scope.Query = function(Query){
        getData(Query);
        toggleNavigation();
    }

    $scope.RepChanged = function(){

    }

    function Cluster(data,keyfield){
        var keyfieldMap = {};
        var keyfieldEl = -1;
        var cluster = [];
        for(var i = 0; i < data.length; i++){
            if(keyfieldMap[data[i][keyfield]] === undefined){
                keyfieldEl++;
                keyfieldMap[data[i][keyfield]] = keyfieldEl;
                var newCluster = [];
                newCluster.push(data[i]);
                cluster.push(newCluster);
            }else{
                cluster[keyfieldMap[data[i][keyfield]]].push(data[i])
            }
        }
        return cluster;
    }

    function addClusteredMarkers(){
        // Loop through our array of markers & place each one on the map
        for( i = 0; i < map_points.length; i++ ) {
            var hex = genHex();
            var cluster = map_points[i];
            var rep = {};
            rep.Name = map_points[i][0].RepName;
            rep.Hex = hex;
            rep.Show = true;
            $scope.keys.push(rep);

            //console.log(map_points[i][0].RepName + " " + hex);
            for(x = 0; x < cluster.length; x++){

                var infoWindow = new google.maps.InfoWindow(), marker, x;
                var position = new google.maps.LatLng(cluster[x].Latitude, cluster[x].Longitude);

                bounds.extend(position);
                marker = new google.maps.Marker({
                    position: position,
                    map: map,
                    icon: {
                      path: fontawesome.markers.MAP_PIN,
                      scale: 0.4,
                      strokeWeight: 0.0,
                      strokeColor: 'black',
                      strokeOpacity: 0,
                      fillColor: hex,
                      fillOpacity: 1
                  },
                    clickable: true,
                    title: cluster[x].Name
                });

                attachInfo(marker,cluster[x].CustomerLocations_CONV_Customers_Name)
                map.fitBounds(bounds);
            }
        }
    }

    function attachInfo(marker,info){
        var infowindow = new google.maps.InfoWindow({
            content: info
        });

        marker.addListener('click', function() {
            infowindow.open(marker.get('map'), marker);
        });
    }

    $scope.keysClicked = function(){
        console.log($scope.keys);
        var myOtherModal = $modal({scope: $scope, template: 'modals/keys.html'});
    }

    function addMarkers(){
          // Loop through our array of markers & place each one on the map
          for( i = 0; i < map_points.length; i++ ) {
              var infoWindow = new google.maps.InfoWindow(), marker, i;
              var position = new google.maps.LatLng(map_points[i].Latitude, map_points[i].Longitude);
              //console.log(position);
              bounds.extend(position);
              marker = new google.maps.Marker({
                  position: position,
                  map: map,
                  icon: {
                    path: fontawesome.markers.MAP_PIN,
                    scale: 0.4,
                    strokeWeight: 0.0,
                    strokeColor: 'black',
                    strokeOpacity: 0,
                    fillColor: genHex(),
                    fillOpacity: 1
                },
                  clickable: true,
                  title: map_points[i].Name
              });

              //* Allow each marker to have an info window
              google.maps.event.addListener(marker, 'click', (function(marker, i) {
                  return function() {
                      infoWindow.setContent(map_points[i].Name);
                      infoWindow.open(map, marker);
                  }
              })(marker, i));

              // Automatically center the map fitting all markers on the screen
              map.fitBounds(bounds);
          }
    }

    function genHex() {
        var hex = '#'+ Math.floor(Math.random()*16778215).toString(16);
        return hex;
    }

    function initialize() {
        var mapOptions = {
                center: new google.maps.LatLng(-26.2022700	,28.0436300),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                zoom: 9,
                streetViewControl: false,
                mapTypeControl : false,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                //styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#87d3e3"},{"visibility":"on"}]}]
                styles : [{"featureType":"landscape","stylers":[{"hue":"#FFBB00"},{"saturation":43.400000000000006},{"lightness":37.599999999999994},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#FFC200"},{"saturation":-61.8},{"lightness":45.599999999999994},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":51.19999999999999},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":52},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#0078FF"},{"saturation":-13.200000000000003},{"lightness":2.4000000000000057},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#00FF6A"},{"saturation":-1.0989010989011234},{"lightness":11.200000000000017},{"gamma":1}]}]
        };
        map = new google.maps.Map(document.getElementById("map"), mapOptions);
        addMarkers();
    };

    function constructor() {
        //$http.defaults.headers.common['Authorization'] = 'Basic bGlsZ3JlZW46UEFTU1dPUkQ='; // + Base64.encode('lilgreen:PASSWORD');
        //getData();
        initialize();
    }

    constructor();
}]);
