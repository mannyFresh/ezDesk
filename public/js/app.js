
var app = angular.module("PassportApp", ["ngRoute", "smart-table", "ui.bootstrap", "n3-pie-chart"]);

//Controller for NHLStats app
app.controller('PassportAppController', function ($scope, $http, $location) {
    $http.get('/loggedin').success(function (user) {
        $scope.user = user;
    });

    $scope.logout = function () {
        $http.post('/logout').success(function (response) {
            $scope.user = '0';
            $location.url('/home');
        });
    };
});

app.config(function($routeProvider, $httpProvider) {
    $routeProvider
      .when('/home', {
          templateUrl: 'views/home/home.html',
          controller: 'HomeController'
      })
      .when('/profile', {
          templateUrl: 'views/profile/profile.html',
          controller: 'ProfileCtrl',
          resolve: {
              loggedin: checkLoggedin
          }
      })
      .when('/login', {
          templateUrl: 'views/login/login.html',
          controller: 'LoginCtrl'
      })
      .when('/register', {
          templateUrl: 'views/register/register.html',
          controller: 'RegisterCtrl'
      })
      .otherwise({
          redirectTo: '/profile'
      });
});

var checkLoggedin = function($q, $timeout, $http, $location, $rootScope)
{
    var deferred = $q.defer();

    $http.get('/loggedin').success(function(user)
    {
        $rootScope.errorMessage = null;
        // User is Authenticated
        if (user !== '0')
        {
            $rootScope.currentUser = user;
            deferred.resolve();
        }
        // User is Not Authenticated
        else
        {
            $rootScope.errorMessage = 'You need to log in.';
            deferred.reject();
            $location.url('/home');
        }
    });
    
    return deferred.promise;
};
