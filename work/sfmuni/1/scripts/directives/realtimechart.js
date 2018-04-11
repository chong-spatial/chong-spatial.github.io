angular.module('SFMuniVIS')
  .directive('realtimeChart', ['sharedService', function(sharedService) {
    var realtimechart = d3.realtimeLineChart().chartTitle('GPS Report Delay Tracking').yTitle('Delay (second)').xTitle('Time');
        return {
            restrict: 'E',     
            scope:{               
                timedata: '='    
            },
            link: function($scope, $element, $attrs) {          
                // select the element of this directive
                var div = d3.select($element[0]);                
                var w, h;

                // update the vis when the data get's updated
                $scope.$watch('timedata', function(newVal, oldVal) {
                  div.datum(newVal).call(realtimechart);
                  sharedService.timelinevis(realtimechart);
                });

                // keep watching for the size changes
                $scope.$watch(function(){
                  var bbox = div.node().getBoundingClientRect();
                  w = bbox.width || 400
                  h = bbox.height || 400;
                  return w || h;
                }, resize);
                
                function resize(){
                  realtimechart.resize(w, h);                  
                }
           
            }
        };
  }]);
