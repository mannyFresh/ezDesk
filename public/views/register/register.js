
app.controller("RegisterCtrl", function($scope, $http, $location, $rootScope){
    $scope.register = function(user){
        console.log(user);
        if(user.password != user.password2 || !user.password || !user.password2)
        {
            $scope.errorMessage = 'Your passwords do not match. Try that again.'
            return;
        }
        else
        {
            $http.post("/register", user)
            .success(function(response){
                console.log(response);
                if(response != null)
                {
                    $rootScope.currentUser = response;
                    $location.url("/profile");
                }
            });
        }
    }
});

