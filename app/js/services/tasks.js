appService = angular.module('taskService', [])

appService.factory('Tasks', ['$http',function($http) {
		return {
			get : function() {
				return $http.get('/api/tasks');
			},
			create : function(taskData) {
				return $http.post('/api/tasks', taskData);
			},
			update : function(id, taskData) {
				return $http.post('/api/tasks/' + id, taskData);
			},
			addUser : function(id, taskData) {
				return $http.post('/api/tasks/users/' + id, taskData);
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
					  <div class="modal-dialog">
							  <div class="modal-content">
									  <div class="modal-header">
									  <h3 class="modal-title">Edit Task</h3>
									  </div>
									  <div class="modal-body">

									  <form>
											<div class="form-group">
												<div class="input-group-prepend">
													<span class="input-group-text"> 
														<label>Task Name</label>
													</span>
												</div>
												<input type="text" name="name" ng-model="formData.title" placeholder="Task name"  class="form-control"/>
											</div>									  
																
									
											<div class="form-group">
												<div class="input-group-prepend">
													<span class="input-group-text"> 
														<label>Task Details</label>
													</span>
												</div>
												<textarea name="details" ng-model="formData.details" class="form-control" rows="5" placeholder="Task details"></textarea>
										    </div>
							  
											<div class="form-group">
												<div class="input-group-prepend">
													<span class="input-group-text"> 
														<label>Due Date</label>
													</span>
												</div>
												<input type="date" name="dueDate" ng-init="model=(myDate | date:'dd-MM-yyyy')" ng-model="formData.dueDate" class="form-control"/>
											</div>
									
											<input type="hidden" ng-model="formData._id" />
									
											</div>
											<div class="modal-footer">
													<button class="btn btn-success"  ng-click="editRow(); close()">Save</button>
					
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