
var app = angular.module('taskController', ['ngTouch', 'ui.grid', 'ui.grid.selection', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav', 'ngRoute']);

// a custom date fromatter directive
app.directive('dateFormat', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attr, ngModelCtrl) {
            //Reset default angular formatters/parsers
            ngModelCtrl.$formatters.length = 0;
            ngModelCtrl.$parsers.length = 0;
        }
    };
});

// the main application controller
app.controller('mainController', 
	[
		'$rootScope', '$scope', '$http', '$location', 'modal', '$q', 'Tasks', 'Users',  
		function($rootScope, $scope, $http, $location, modal, $q, Tasks, Users) {
			$scope.formData = {};
			$scope.loading = true;
			$scope.myDate = new Date('08-03-2020T00:00:00');
		
			$scope.gridOptionsTasks = {
					columnDefs: [
						{ 
							name: 'title', 
							displayName: 'Task Name',
							cellEditableCondition: false,
							enableColumnResizing: true
						},
						{ 
							name: 'details', 
							displayName: 'Task Details',
							cellEditableCondition: false,
							enableColumnResizing: true
						},
						{ 
							name: 'dueDate', 
							displayName: 'Due Date', 
							type: 'date', 
							cellFilter: 'date:"dd-MM-yyyy"',
							cellEditableCondition: false,
							enableColumnResizing: false
						},
						{ 
							name: 'done', 
							displayName: 'Done', 
							type: 'boolean',
							cellEditableCondition: true,
							enableColumnResizing: false
						},
						{ 
							name: 'Delete', 
							cellTemplate: '<button class="btn btn-danger" ng-click="grid.appScope.deleteRow(row)">Delete</button>',
							cellEditableCondition: false,
							enableFiltering: false,
							enableSorting: false,
							enableColumnResizing: false
						},
						{ 
							name: 'Edit', 
							cellTemplate: '<button class="btn btn-info" ng-click="grid.appScope.showModal(row)">Edit</button>',
							cellEditableCondition: false,
							enableFiltering: false,
							enableSorting: false,
							enableColumnResizing: false
						}
					],
					showFooter: true,
					enableSorting: true,
					multiSelect: false,
					enableFiltering: true,     
					enableRowSelection: true, 
					enableSelectAll: false,
					enableRowHeaderSelection: true,  
					noUnselect: true,
					rowHeight: 37,

					onRegisterApi: function(gridApi){
						$scope.gridApi = gridApi;
						gridApi.rowEdit.on.saveRow($scope, $scope.editRow);
						gridApi.selection.on.rowSelectionChanged($scope,function(row){
							var msg = 'Tasks row selected ' + row.isSelected + " with id " + row.entity._id;
							$scope.task = row.entity;
							console.log(msg);
						});
					}
			};

			$scope.gridOptionsUsers = {	
				columnDefs: [
					{ 
						name: 'userName',
						displayName: 'User Name',
						cellEditableCondition: false,
						enableColumnResizing: true
					},
					{ 
						name: 'created',
						displayName: 'Registration Date',
						cellEditableCondition: false,
						enableColumnResizing: true
					}
				],
				showFooter: true,
				multiSelect: false,
				enableSorting: true,
				enableFiltering: true,
				enableRowSelection: true,
				enableSelectAll: true,
				enableRowHeaderSelection: true,
                rowHeight: 37,
				onRegisterApi: function(gridApi){
					//set gridApi on scope
					$scope.gridApi = gridApi;
					gridApi.selection.on.rowSelectionChanged($scope,function(row){
					  var msg = 'Users row selected ' + row.isSelected + " with id " + row.entity._id;
					  $scope.user_id = row.entity._id;
					  console.log(msg);
					});
				},
			};

			// GET =====================================================================
			// when landing on the page, get all users and show them
			// use the service to get all the users
			Users.get()
				.then(
					function(response) {
						$scope.users = response.data;
						$scope.loading = false;
						$scope.gridOptionsUsers.data = response.data;
						console.log("Got user data: " + JSON.stringify(response.data, null, 4));
					},
					function (error){
						console.log(error, 'Cannot user get data');
					}
				);

			$scope.addUserToTask = function() {
				var userId = $scope.user_id;
                if (userId == null || $scope.task._id == null) {
					alert("Please select a task and a user from the tables to link them together");
					return;
				} 
			
				var returnvalue = confirm("Are you sure to add user " + userId + " to task " + $scope.task._id);
				if (returnvalue == true) {
					Tasks.addUser(userId, $scope.task)
						.then(
							function(response) {
								console.log(error, 'Assigned a task to the user');
							},
							function (error){
								console.log(error, 'Cannot assign a task to the user task');
							}
						);
				}
			};

			// GET =====================================================================
			// when landing on the page, get all tasks and show them
			// use the service to get all the tasks
			Tasks.get()
				.then(
					function(response) {
						$scope.tasks = response.data;
						$scope.loading = false;
						$scope.gridOptionsTasks.data = response.data;
						console.log("Got task data: " + JSON.stringify(response.data, null, 4));
					},
					function (error){
						console.log(error, 'Cannot get data');
					}
				);

			// CREATE ==================================================================
			// when submitting the add form, send the text to the node API
			$scope.createTask = function() {

				// validate the formData to make sure that something is there
				// if form is empty, nothing will happen
				if ($scope.formData.title != undefined) {
					$scope.loading = true;

					// call the create function from our service (returns a promise object)
					Tasks.create($scope.formData)
						// if successful creation, call our get function to get all the new tasks
						.then(
							function(response) {
								var n = $scope.gridOptionsTasks.data.length + 1;
								$scope.gridOptionsTasks.data.push({
									"title": $scope.formData.title,
									"details": $scope.formData.details,
									"dueDate": new Date($scope.formData.dueDate),
									"done": false
								});
								$scope.loading = false;
								$scope.formData = {}; // clear the form so our user is ready to enter another
								$scope.tasks = response.data; // assign our new list of tasks  
							},
							function (error){
								console.log(error, 'Cannot create task');
							}
						);
				}
			};

			$scope.deleteRow = function(row) {
				var returnvalue = confirm("Are you sure to delete task " + row.entity.title);
				if (returnvalue == true) {
					Tasks.delete(row.entity._id)
						.then(
							function(response) {
								$scope.tasks = response.data;
							},
							function (error){
								console.log(error, 'Cannot delete task');
							}
						);

					var index = $scope.gridOptionsTasks.data.indexOf(row.entity);
					$scope.gridOptionsTasks.data.splice(index, 1);
				}
			};		

			$scope.editRow = function( rowEntity ) {
				// call the create function from our service (returns a promise object)
				Tasks.update(rowEntity._id, rowEntity)
					// if successful creation, call our get function to get all the new tasks
					.then(
						function(response) {
							rowEntity.dueDate = new Date(rowEntity.dueDate);
							$scope.loading = false;
							$scope.formData = {}; // clear the form so our user is ready to enter another
							$scope.tasks = response.data; // assign our new list of tasks
							$location.url("/home");
						},
						function (error){
							console.log(error, 'Cannot update task');
						}
					);
			};	

			// UPDATE ==================================================================
			// when submitting the add form, send the text to the node API
			$scope.updateTask = function(id) {
				console.log("Updating id: " + id + ", with: " + JSON.stringify($scope.formData, null, 4));

				// validate the formData to make sure that something is there
				// if form is empty, nothing will happen
				if ($scope.formData.title != undefined) {
					$scope.loading = true;

					// call the create function from our service (returns a promise object)
					Tasks.update(id, $scope.formData)
						// if successful creation, call our get function to get all the new tasks
						.then(
							function(response) {
								$scope.loading = false;
								$scope.formData = {}; // clear the form so our user is ready to enter another
								$scope.tasks = response.data; // assign our new list of tasks
							},
							function (error){
								console.log(error, 'Cannot update task');
							}
						);
				}
			};

			// A modal view for editing a task on a new pop-up window
			var myModal = new modal();
			$scope.showModal = function(row) {
				console.log("Row entity: " + JSON.stringify(row.entity , null, 4));

				$rootScope.formData = row.entity;
				$rootScope.row = row.entity
				$rootScope.editRow = function() {
					var returnvalue = confirm("Are you sure to update task " + row.entity.title);
					if (returnvalue == true) {
						// call the create function from our service (returns a promise object)
						Tasks.update($rootScope.formData._id, $rootScope.formData)
							// if successful creation, call our get function to get all the new tasks
							.then(
								function(response) {
									$scope.loading = false;
									$scope.formData = {}; // clear the form so the user is ready to enter another
									$scope.tasks = response.data; // assign our new list of tasks
								},
								function (error){
									console.log(error, 'Cannot update task');
								}
							);
					}
				};
				myModal.open(row.entity);
			};
		}
	]
);