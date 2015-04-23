app.controller("LoginController", function($scope, $http, $location, $rootScope){
    $scope.login = function (user) {

        $http.post("/login", user)
        .success(function (response) {

            sessionStorage.currentUser = response;

            $location.url("/profile");

            if (response.roles.indexOf('admin') != -1) {

            	toastr.info("hello admin! here's the data ~");

            }

            else {

            	toastr.info("hello " + response.username + "! please select your desk preference");

            }
            
        }).error(function (response) {

        	toastr.error("username / password unauthorized");

        });
    }
});
