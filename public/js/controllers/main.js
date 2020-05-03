
var app = angular.module('taskController', ['ngTouch', 'ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav']);

app.controller('mainController', ['$scope', '$http', '$q', 'Tasks',  function($scope, $http, $q, Tasks) {

	//angular.module('taskController', []).controller('mainController', ['$scope','$http','Tasks', function($scope, $http, Tasks) {

	    $scope.gridOptions = {};
		$scope.formData = {};
		$scope.loading = true;
	
		$scope.gridOptions.columnDefs = [
			{ name: '_id', enableCellEdit: false },
			{ name: 'title', displayName: 'Name (editable)' },
			{ name: 'details', displayName: 'Details'},
			{ name: 'dueDate', displayName: 'Due Date' , type: 'date', cellFilter: 'date:"yyyy-MM-dd"'},
			{ name: 'isActive', displayName: 'Active', type: 'boolean'}
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

		$scope.saveRow = function( rowEntity ) {
			// call the create function from our service (returns a promise object)
			Tasks.update(rowEntity._id, rowEntity)
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
			//$scope.gridApi.rowEdit.setSavePromise( rowEntity, promise.promise );
		  };		

		$scope.gridOptions.onRegisterApi = function(gridApi){
			//set gridApi on scope
			$scope.gridApi = gridApi;
			gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
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

		// DELETE ==================================================================
		// delete a task after checking it
		$scope.deleteTask = function(id) {
			$scope.loading = true;

			Tasks.delete(id)
				// if successful creation, call our get function to get all the new tasks
				.then(
					function(response) {
						$scope.loading = false;
						$scope.tasks = response.data; // assign our new list of tasks
					},
					function (error){
						console.log(error, 'Cannot update task');
					}
				);
		};

	}]);
