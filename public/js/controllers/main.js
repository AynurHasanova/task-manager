
var app = angular.module('taskController', ['ngTouch', 'ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav']);

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
		'$rootScope', '$scope', '$http', 'modal', '$q', 'Tasks',  
		function($rootScope, $scope, $http, modal, $q, Tasks) {
			$scope.formData = {};
			$scope.loading = true;
			$scope.myDate = new Date('08-03-2020T00:00:00');
		
			$scope.gridOptions = {
			
					columnDefs: [
						{ 
							name: 'title', 
							displayName: 'Name',
							cellEditableCondition: false,
						},
						{ 
							name: 'details', 
							displayName: 'Details',
							cellEditableCondition: false,
						},
						{ 
							name: 'dueDate', 
							displayName: 'Due Date', 
							type: 'date', 
							cellFilter: 'date:"dd-MM-yyyy"',
							cellEditableCondition: false,
						},
						{ 
							name: 'done', 
							displayName: 'Done', 
							type: 'boolean',
							cellEditableCondition: true,
						},
						{ 
							name: 'Delete', 
							cellTemplate: '<button class="btn primary" ng-click="grid.appScope.deleteRow(row)">Delete</button>',
							cellEditableCondition: false,
							enableFiltering: false,
							enableSorting: false
						},
						{ 
							name: 'Edit', 
							cellTemplate: '<button class="btn primary" ng-click="grid.appScope.showModal(row)">Edit</button>',
							cellEditableCondition: false,
							enableFiltering: false,
							enableSorting: false
						}
					],
					showFooter: true,
					enableSorting: true,
					multiSelect: false,
					enableFiltering: true,     
					enableRowSelection: true, 
					enableSelectAll: false,
					enableRowHeaderSelection: false,  
					enableGridMenu: true,
					noUnselect: true,

					onRegisterApi: function(gridApi){
						$scope.gridApi = gridApi;
						gridApi.rowEdit.on.saveRow($scope, $scope.editRow);
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
						$scope.gridOptions.data = response.data;
						console.log("Got data: " + JSON.stringify(response.data, null, 4));
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
								var n = $scope.gridOptions.data.length + 1;
								$scope.gridOptions.data.push({
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

					var index = $scope.gridOptions.data.indexOf(row.entity);
					$scope.gridOptions.data.splice(index, 1);
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