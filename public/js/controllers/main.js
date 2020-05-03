
var app = angular.module('taskController', ['ngTouch', 'ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav']);

app.directive('dateFormat', function() {
	return {
	  require: 'ngModel',
	  link: function(scope, element, attr, ngModelCtrl) {
		//Angular 1.3 insert a formater that force to set model to date object, otherwise throw exception.
		//Reset default angular formatters/parsers
		ngModelCtrl.$formatters.length = 0;
		ngModelCtrl.$parsers.length = 0;
	  }
	};
  });

app.controller('mainController', ['$rootScope', '$scope', '$http', 'modal', '$q', 'Tasks',  function($rootScope, $scope, $http, modal, $q, Tasks) {
	    $scope.gridOptions = {};
		$scope.formData = {};
		$scope.loading = true;
		$scope.myDate = new Date('08-03-2020T00:00:00');

		/*
		$scope.myGridOptions = {
			showFooter: false,
			enableSorting: true,
			multiSelect: false,
			enableFiltering: true,     
			enableRowSelection: true, 
			enableSelectAll: false,
			enableRowHeaderSelection: false,  
			enableGridMenu: true,
			noUnselect: true,
			onRegisterApi: function (gridApi){
			   $scope.gridApi = gridApi;
			}
		}
		*/

	
		$scope.gridOptions.columnDefs = [
			{ 
				name: 'title', 
				displayName: 'Name' 
			},
			{ 
				name: 'details', 
				displayName: 'Details'
			},
			{ 
				name: 'dueDate', 
				displayName: 'Due Date', 
				type: 'date', 
				cellFilter: 'date:"dd-MM-yyyy"'
			},
			{ 
				name: 'done', 
				displayName: 'Done', 
				type: 'boolean'},
			{ 
			  name: 'Delete', 
			  cellTemplate: '<button class="btn primary" ng-click="grid.appScope.deleteRow(row)">Delete</button>',
			  cellEditableCondition: false
			},
			{ 
				name: 'Edit', 
				cellTemplate: '<button class="btn primary" ng-click="grid.appScope.showModal(row)">Edit</button>',
				cellEditableCondition: false
			  }
		];

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
			Tasks.delete(row.entity._id)
				.then(
					function(response) {
						$scope.loading = false;
						$scope.tasks = response.data;
					},
					function (error){
						console.log(error, 'Cannot delete task');
					}
				);

			var index = $scope.gridOptions.data.indexOf(row.entity);
			$scope.gridOptions.data.splice(index, 1);
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
			//$scope.gridApi.rowEdit.setSavePromise( rowEntity, promise.promise );
		};		

		$scope.gridOptions.onRegisterApi = function(gridApi){
			//set gridApi on scope
			$scope.gridApi = gridApi;
			gridApi.rowEdit.on.saveRow($scope, $scope.editRow);
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

		var myModal = new modal();
		$scope.showModal = function(row) {
			console.log("Row entity: " + JSON.stringify(row.entity , null, 4));
			$rootScope.row = row.entity
			myModal.open(row.entity);
		};

	}]);
