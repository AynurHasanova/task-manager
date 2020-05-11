
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
		'$rootScope', '$scope', '$http', '$location', 'editModal', 'detailsModal', 'userTasksModal', '$q', 'Tasks', 'Users',  
		function($rootScope, $scope, $http, $location, editModal, detailsModal, userTasksModal, $q, Tasks, Users) {
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
							name: 'dueDate', 
							displayName: 'Due Date', 
							type: 'date', 
							cellFilter: 'date:"dd-MM-yyyy"',
							cellEditableCondition: false,
							enableColumnResizing: false
						},
						{ 
							name: 'priority', 
							displayName: 'Priority', 
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
							name: 'Details', 
							cellTemplate: '<button class="btn btn-info" ng-click="grid.appScope.showDetailsModal(row)">Details</button>',
							cellEditableCondition: false,
							enableFiltering: false,
							enableSorting: false,
							enableColumnResizing: false
						},
						{ 
							name: 'Delete', 
							cellTemplate: '<button ng-disabled="!grid.appScope.currentUser" class="btn btn-danger" ng-click="grid.appScope.deleteRow(row)">Delete</button>',
							cellEditableCondition: false,
							enableFiltering: false,
							enableSorting: false,
							enableColumnResizing: false
						},
						{ 
							name: 'Edit', 
							cellTemplate: '<button ng-disabled="!grid.appScope.currentUser" class="btn btn-info" ng-click="grid.appScope.showEditModal(row)">Edit</button>',
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

			$rootScope.gridOptionsUserTasks = {
				columnDefs: [
					{ 
						name: 'title', 
						displayName: 'Task Name',
						cellEditableCondition: false,
						enableColumnResizing: true
					},
					{ 
						name: 'priority', 
						displayName: 'Priority', 
						cellEditableCondition: false,
						enableColumnResizing: false
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
						cellEditableCondition: false,
						enableColumnResizing: false
					}
				],
				showFooter: true,
				enableSorting: true,
				multiSelect: false,
				enableFiltering: true,     
				enableRowSelection: true, 
				enableSelectAll: false,
				enableRowHeaderSelection: false,  
				noUnselect: true,
				rowHeight: 37
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
					},
					{ 
						name: 'Add to Task', 
						cellTemplate: '<button ng-disabled="!grid.appScope.currentUser" class="btn btn-success" ng-click="grid.appScope.addUserToTask(row)">Add to Task</button>',
						cellEditableCondition: false,
						enableFiltering: false,
						enableSorting: false,
						enableColumnResizing: false
					},
					{ 
						name: 'Show Tasks', 
						cellTemplate: '<button class="btn btn-info" ng-click="grid.appScope.getUserTasks(row.entity); grid.appScope.showUserTasksModal(row)">Show Tasks</button>',
						cellEditableCondition: false,
						enableFiltering: false,
						enableSorting: false,
						enableColumnResizing: false
					},
				],
				showFooter: true,
				multiSelect: false,
				enableSorting: true,
				enableFiltering: true,
				enableRowSelection: true,
				enableSelectAll: true,
				enableRowHeaderSelection: false,
                rowHeight: 37,
				onRegisterApi: function(gridApi){
					//set gridApi on scope
					$scope.gridApi = gridApi;
					gridApi.selection.on.rowSelectionChanged($scope,function(row){
					  var msg = 'Users row selected ' + row.isSelected + " with id " + row.entity._id;
					  console.log(msg);
					});
				},
			};

			// GET =====================================================================
			// use the service to get all the users
			Users.get()
				.then(
					function(response) {
						$scope.users = response.data;
						$scope.loading = false;
						$scope.gridOptionsUsers.data = response.data;
					},
					function (error){
						console.log(error, 'Cannot user get data');
					}
				);

			$scope.addUserToTask = function(row) {
				var userID = row.entity._id;
				var userName = row.entity.userName;
				console.log("userID: " + userID);
				// if a userID, task, or taskID is null we cannot do anything
                if (userID == null || $scope.task == null || ( $scope.task != null && $scope.task._id == null) ) {
					alert('Please select a task from the task table for user "' + userName + '"');
					return;
				} 
			
				var returnvalue = confirm('Are you sure to add user "' + userName + '" to task  "' + $scope.task.title + '"');
				if (returnvalue == true) {
					Tasks.addUser(userID, $scope.task)
						.then(
							function(response) {
								console.log(error, 'Assigned user "' + userName + '" to task "' + $scope.task  + '"');
							},
							function (error){
								console.log(error, 'Failed to assign user "' + userName + '" to task "' + $scope.task  + '"');
							}
						);
				}
			};

			// GET =====================================================================
			// when loading on the home page, get all tasks and show them
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

			$scope.getUserTasks = function(user) {
				if ( user != undefined ) {
					var userID = user._id;
					var userName = user.userName;
					if (userID != undefined ) { 
						console.log("Extracted userID: " + userID);
					} else if (user.data._id != undefined) {
						userID = user.data._id;
						console.log("Extracted userID from user data: " + userID);
					}
					if ( userName != undefined ) {
						$rootScope.currentUser.data = user;
						console.log("Extracted userName: " + userName);
					} else if ( user.data.userName != undefined ) {
						userName = user.data.userName;
						$rootScope.currentUser = user;
						console.log("Extracted userName from user data: " + userName);
					}
					//console.log("$rootScope.currentUser : " + JSON.stringify($rootScope.currentUser, null, 4));
					Tasks.findByUser(userID)
						.then(
							function(response) {
								console.log("Got task data: " + JSON.stringify(response.data, null, 4));
								$rootScope.gridOptionsUserTasks.data = response.data;
							},
							function (error){
								console.log(error, 'Failed to get tasks by user id "' + userID + '"');
							}
						);
				}
			};

			if ($rootScope.currentUser != undefined) {
				$scope.getUserTasks($rootScope.currentUser);
			}

			// CREATE ==================================================================
			// when submitting the add form, send the text to the node API
			$scope.createTask = function() {

				// validate the formData
				// if the form is empty, nothing will happen
				if ($scope.formData.title != undefined) {
					$scope.loading = true;

					Tasks.create($scope.formData)
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
								$scope.formData = {}; // clear the form so we're ready to enter more
								$scope.tasks = response.data; // assign our new list of tasks
								$location.url("/alltasks");
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
				Tasks.update(rowEntity._id, rowEntity)
					.then(
						function(response) {
							rowEntity.dueDate = new Date(rowEntity.dueDate);
							$scope.loading = false;
							$scope.formData = {};
							$scope.tasks = response.data; // assign our new list of tasks
							$location.url("/alltasks");
						},
						function (error){
							console.log(error, 'Cannot update task');
						}
					);
			};

			// A modal view for editing a task on a new pop-up window
			var editModal = new editModal();
			$scope.showEditModal = function(row) {
				console.log("Row entity: " + JSON.stringify(row.entity , null, 4));

				$rootScope.formData = row.entity;
				$rootScope.row = row.entity
				$rootScope.editRow = function() {
					var returnvalue = confirm("Are you sure to update task " + row.entity.title);
					if (returnvalue == true) {
						Tasks.update($rootScope.formData._id, $rootScope.formData)
							.then(
								function(response) {
									$scope.loading = false;
									$scope.formData = {};
									$scope.tasks = response.data; // assign our new list of tasks
								},
								function (error){
									console.log(error, 'Cannot update task');
								}
							);
					}
				};
				editModal.open(row.entity);
			};

			// A modal view for viewing a task details on a new pop-up window
			var detailsModal = new detailsModal();
			$scope.showDetailsModal = function(row) {
				console.log("Row entity: " + JSON.stringify(row.entity , null, 4));
				$rootScope.formData = row.entity;
				$rootScope.row = row.entity
				detailsModal.open(row.entity);
			};


			// A modal view for viewing user's tasks on a new pop-up window
			var userTasksModal = new userTasksModal();
			$scope.showUserTasksModal = function(row) {
				$rootScope.formData = row.entity;
				userTasksModal.open();
			};

		}
	]
);