/**
 * @ngdoc directive
 * @name SFMuniVIS.directive:treeChart
 * @description
 * # treeChart
 */
angular.module('SFMuniVIS')
  .directive('treeChart', ['sharedService', function(sharedService) {
    var treechart = d3.treeChart();
    return {
      restrict: 'E',
      scope: {               
          treedata: '='
      },      
      link: function($scope, $element, $attrs) {

          // select the element of this directive
          var div = d3.select($element[0]);
          var w, h;
      
          // update the vis when the data get's updated          
          $scope.$watch('treedata', function(newValue, oldValue) {
            if (!newValue) return;
            div.datum(newValue).call(treechart);
            sharedService.treevis(treechart);
             
          });

          // keep watching for the size changes
          $scope.$watch(function(){
            var bbox = div.node().getBoundingClientRect();
            w = bbox.width || 200
            h = bbox.height || 400;
            return w || h;
          }, resize);

          function resize(){
            treechart.width(w).height(h);                  
          }         

          

          treechart.on('nodeClick.ext', function(d) {
            switchRoutes();

          })

          function switchRoutes() {
            var displayRoutes = treechart.getUncheckedNodes();
            if(displayRoutes.length == 0) d3.select('.map').selectAll('.vehicle').style('display', 'none');

            var displayRouteTags = [], hiddenRouteTags = [];
            for(var i = 0; i < displayRoutes.length; i++){
              var selR = displayRoutes[i];
              if(!~displayRouteTags.indexOf(selR.tag)) {
                displayRouteTags.push(selR.tag);
              } 

            }
            d3.select('.map').selectAll('.vehicle').style('display', 'none');
            displayRouteTags.forEach(function(t) {
              d3.select('.map').select('.vehicles').selectAll('.t' + t).style('display', 'block');
            })

            sharedService.shownRoutes(displayRouteTags.slice(0));

        }


      }
    };
  }]);
