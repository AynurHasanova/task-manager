appService = angular.module('taskService', [])

appService.factory('Tasks', ['$http',function($http) {
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


appService.factory('modal', ['$compile', '$rootScope', function ($compile, $rootScope) {
		return function() {
		  var elm;
		  var modal = {
			open: function() {
	   
			  var html = `
					<div class="modal" ng-style="modalStyle"> 
						{{modalStyle}} 
						<div class="modal-dialog">
								<div class="modal-content">
										<div class="modal-header">
										</div>
										<div>
											<label>Task Name</label>
											<input type="text" name="name" ng-model="formData.title"/>
									
											<label>Task Details</label>
											<input type="text" name="address" ng-model="formData.details"/>
									
											<label>Due Date</label>
											<input type="date" name="dueDate" ng-model="formData.dueDate" date-format/>
									
											<br/>
									
											<input type="hidden" ng-model="formData._id" />
											<input type="button" value="Save" ng-click="editRow(); close()" class="btn btn-primary"/>
								  
										</div>
										<div class="modal-footer">
												<button id="buttonClose" class="btn btn-primary" ng-click="close()">
													Close
												</button>
										</div>
								</div>
						</div>
					</div>`;

			  elm = angular.element(html);
			  angular.element(document.body).prepend(elm);
	   
			  $rootScope.close = function() {
				modal.close();
			  };
	   
			  $rootScope.modalStyle = {"display": "block"};
	   
			  $compile(elm)($rootScope);
			},
			close: function() {
			  if (elm) {
				elm.remove();
			  }
			}
		  };
	   
		  return modal;
		};
}]);