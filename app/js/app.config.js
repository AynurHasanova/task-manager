app.config(function($routeProvider) {
    $routeProvider.
    when('/home', {
        templateUrl: 'views/home.html'
    }).
    when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
    }).
    when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'SignUpCtrl'
    }).
    when('/alltasks', {
        templateUrl: 'views/alltasks.html',
        controller: 'mainController'
    }).
    when('/mytasks', {
        templateUrl: 'views/mytasks.html',
        controller: 'mainController',
        resolve: {
            logincheck: checkLoggedin
        }
    }).
    when('/create', {
        templateUrl: 'views/create.html',
        controller: 'mainController',
        resolve: {
            logincheck: checkLoggedin
        }
    }).   
    otherwise({
        redirectTo: '/home'
    });
});

var checkLoggedin = function($q, $timeout, $http, $location, $rootScope) {
    var deferred = $q.defer();

    $http.get('/loggedin').
        then(
            function(res) {
                console.log("Client loggedin. response: " + JSON.stringify(res, null, 4));
                $rootScope.errorMessage = null;
                //User is Authenticated
                if (res.data !== '0') {
                    $rootScope.currentUser = res.data;
                    console.log("Logged in user is " + res.data.userName);
                    deferred.resolve();
                } else { //User is not Authenticated
                    $rootScope.errorMessage = 'You need to log in.';
                    deferred.reject();
                    $location.url('/login');
                }
            },
            function (error){
                console.log(error, 'Cannot check if the user loggedin');
            }
        );

    return deferred.promise;
}
