appService = angular.module('userService', [])

appService.factory('Users', ['$http',function($http) {
		return {
			get : function() {
				return $http.get('/api/users');
			}
		}
}]);