angular.module('SFMuniVIS').directive('inactiveList', ['sharedService', function(sharedService) {
    return {
    	restrict: 'E',    
    	template: '<ul></ul>', 
    	scope: {
    		mornitoredVehicleId: '=',
    		newMapCenter: '='
    	}
    };
}]);