app.controller("LoginCtrl", function($scope, $http, $location, $rootScope){
    $scope.login = function(user){
        $http.post("/login", user)
        .success(function(response){
            sessionStorage.currentUser = response;
            $location.url("/profile");
        });
    }
});
