'use strict';

/**
 * @ngdoc overview
 * @name SFMuniVIS
 * @description
 * # SFMuniVIS
 *
 * Main module of the application.
 */
angular.module('SFMuniVIS', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/about', {
        templateUrl: 'views/about.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  });


angular
  .module('SFMuniVIS', ['ngMaterial']);

angular.module('SFMuniVIS')
  .constant('constants', {
      minSymbolSize: 10,
      feedURL: {
        vehicleURL: 'https://cors-anywhere.herokuapp.com/http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&t=',
        routeURL: "https://cors-anywhere.herokuapp.com/http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni",
        routeConfigURL: 'https://cors-anywhere.herokuapp.com/http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r='
      }
  })

angular.module('SFMuniVIS')
  .factory('sharedService', function($rootScope) {
    var shownRoutes = null;
    var highlightRoute = "";
    var inactiveVehicles = [];

    var treevis, timelinevis;

    var service = {};
    service.addShownRoute = function (_) {
      shownRoutes.push(_);
    }

    service.removeShownRoute = function(_) {
        var index = shownRoutes.indexOf(_);
        shownRoutes.splice(index, 1);
    };
    service.shownRoutes = function(_) {
      if(!arguments.length){
        return shownRoutes;
      }
      shownRoutes = _;
    };

    service.highlightRoute = function(_) {
      if(!arguments.length){
        return highlightRoute;
      }
      highlightRoute = _;
    }

    service.treevis = function(_) {
      if(!arguments.length){
        return treevis;
      }
      treevis = _;
    };

    service.timelinevis = function(_) {
      if(!arguments.length){
        return timelinevis;
      }
      timelinevis = _;
    };


    service.routeColorScale = d3.scale.ordinal().range(d3.scale.category10().range());
    service.delayDeviationColorScale = d3.scale.linear().range(["#ccc", '#777', '#000']);


    return service;


  })

