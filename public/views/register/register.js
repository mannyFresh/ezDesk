
app.controller("RegisterController", function($scope, $http, $location, $rootScope){
    $scope.register = function(user){
        console.log(user);
        if(user.password != user.password2 || !user.password || !user.password2)
        {
            toastr.warning("your passwords do not match");
        }
        else
        {
            user.usernameLowercase = user.username.toLowerCase();
            
            $http.post("/register", user)
            .success(function (response){
                if(response != null)
                {
                    $rootScope.currentUser = response;
                    $location.url("/profile");
                    toastr.info("hello " + response.username + "! please select your desk preference");
                }
            }).error(function (response) {
                toastr.warning(response);
            });
        }
    }
});

