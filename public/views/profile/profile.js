app.factory('ProfileFactory', function ($http, $rootScope) {
    var getAllUsers = function () {
        $http.get("/rest/user")
        .success(function(users) {
            $rootScope.users = users;
        });
    }

    var getUserProfile = function (username) {
        $http.get("/rest/user/" + username)
        .success(function(user)
        {
            $rootScope.userProfile = user[0];
        });
    }

    ////// THIS ARE METHODS FOR ADMIN USERS

    var removeProfile = function (userID, callback) {
        $http.delete('/rest/user/' + userID)
        .success(callback);
    }

    var updateProfile = function (userID, user, callback) {
        $http.put('/rest/user/' + userID, user)
        .success(callback)
    }

    var addProfile = function (user, callback) {
        $http.post('/rest/user', user)
        .success(callback);
    }

    var getDeskResults = function () {

        var deskData = [];
        $http.get('/rest/desk')
        .success(function (desks) {

            //var employeeCount = desks.pop();

            var totalEmployees = desks.reduce(function (a, b) {
                return a + b["count"];
            }, 0);

            var colors = ["#d62728", "#1f77b4", "#ff7f0e", "#2ca02c"];

            angular.forEach(desks, function(desk, color) {

                if (desk._id === null) {
                    desk._id = "No Desk";
                }

                deskDataGaugeObject = {
                    data: [{label: desk._id, value: Math.floor(((desk.count / totalEmployees)) * 100), color: colors[color], suffix: "%"}],
                    options: {thickness: 15, mode: "gauge", total: 100}
                }

                this.push(deskDataGaugeObject);

            }, deskData);

            var pieData = [];

            angular.forEach(desks, function (desk, color) {

                if (desk._id === "No Desk") {
                    desk._id = "None";
                }
                else if (desk._id != null) {
                    desk._id = desk._id.split(' ')[0];
                }

                this.push({label: desk._id + ' - ' + desk.count , value: desk.count, color: colors[color]});

                

            }, pieData);

            deskDataPieObject = {
                data: pieData,
                options: {thickness: 15}
            }

            deskData.push(deskDataPieObject);

            $rootScope.deskData = deskData;
        });
    }

    return {
        getAllUsers: getAllUsers,
        getUserProfile: getUserProfile,
        removeProfile: removeProfile,
        updateProfile: updateProfile,
        addProfile: addProfile,
        getDeskResults: getDeskResults
    };
});

app.controller('ProfileCtrl', function ($scope, ProfileFactory) {
    
    ProfileFactory.getAllUsers();

    ProfileFactory.getDeskResults();

    $scope.remove = function(user)
    {
        ProfileFactory.removeProfile(user._id, function (users) {
            $scope.users = users;
        });

    }
    
    $scope.update = function(user)
    {
        ProfileFactory.updateProfile(user._id, user, function (users) {
            $scope.users = users;
            toastr.success("desk selected!");
        });
    }
    
    $scope.add = function(user)
    {
        ProfileFactory.addProfile(user, function(users){
            $scope.users = users; 
        });
    }
    
    $scope.select = function(user)
    {
        $scope.user = user;
    }
});

