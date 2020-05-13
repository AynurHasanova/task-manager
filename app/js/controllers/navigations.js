app.controller("NavCtrl", function($rootScope, $scope, $http, $location) {
    $scope.logout = function() {
      $http.post("/logout")
        .then(
			function() {
				$rootScope.currentUser = null;
				$location.url("/home");
			},
			function (error){
				console.log(error, 'Logout failed');
				swal("Logout failed");
			}
		);
    }
});
  
app.controller("SignUpCtrl", function($scope, $http, $rootScope, $location) {
    $scope.signup = function(user) {

      // TODO: verify passwords are the same and notify user
      if (user.password == user.password2) {
        $http.post('/signup', user)
          .then(
			  function(response) {
				$rootScope.currentUser = response;
				$location.url("/alltasks");
			  },
			  function (error){
				console.log(error, 'Cannot signup');
				swal("Try a different user id");
			  }				
		  );
      }
    }
});
  
app.controller("LoginCtrl", function($location, $scope, $http, $rootScope) {
    $scope.login = function(user) {

      $http.post('/login', user)
        .then(
			function(response) {
				$rootScope.currentUser = response;
				$location.url("/alltasks");
			},
			function (error) {
				console.log(error, 'Cannot login');
				swal("Wrong credentials");
			}				
		);
    }
});