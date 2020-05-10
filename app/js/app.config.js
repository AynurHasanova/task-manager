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
    when('/profile', {
        templateUrl: 'views/profile.html',
        resolve: {
            logincheck: checkLoggedin
        }
    }).
    when('/edit', { // TODO - bunu davam ele gorek
        templateUrl: 'views/edit.html',
        controller: 'SignUpCtrl'
    }).
    when('/create', {
        templateUrl: 'views/create.html',
        controller: 'mainController'
    }).   
    otherwise({
        redirectTo: '/home'
    });
});

var checkLoggedin = function($q, $timeout, $http, $location, $rootScope) {
    var deferred = $q.defer();

    $http.get('/loggedin').success(function(user) {
        $rootScope.errorMessage = null;
        //User is Authenticated
        if (user !== '0') {
            $rootScope.currentUser = user;
            deferred.resolve();
        } else { //User is not Authenticated
            $rootScope.errorMessage = 'You need to log in.';
            deferred.reject();
            $location.url('/login');
        }
    });

    return deferred.promise;
}
