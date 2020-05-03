angular.module('taskService', [])

	// super simple service
	// each function returns a promise object 
	.factory('Tasks', ['$http',function($http) {
		return {
			get : function() {
				return $http.get('/api/tasks');
			},
			create : function(taskData) {
				console.log("Got taskData: " + taskData)
				console.log(JSON.stringify(taskData, null, 4));
				return $http.post('/api/tasks', taskData);
			},
			update : function(id, taskData) {
				console.log("Got taskData: " + taskData)
				console.log(JSON.stringify(taskData, null, 4));
				return $http.post('/api/tasks/' + id, taskData);
			},
			delete : function(id) {
				return $http.delete('/api/tasks/' + id);
			}
		}
	}]);