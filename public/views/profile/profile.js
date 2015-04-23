app.factory('ProfileFactory', function ($http, $rootScope) {

    var getAllUsers = function () {
        $http.get("/rest/user")
        .success(function(users) {
            $rootScope.users = users;
        });
    }

    var updateProfile = function (userID, user, callback) {
        $http.put('/rest/user/' + userID, user)
        .success(callback)
    }

    var getDeskResults = function () {

        var deskData = [];

        $http.get('/rest/desk')
        .success(function (desks) {

            // Calculate the total # of employees
            var totalEmployees = desks.reduce(function (a, b) {
                return a + b["count"];
            }, 0);

            var colors = ["#d62728", "#1f77b4", "#ff7f0e", "#2ca02c"];

            // FOREACH DESK: configure a desk percent gauge
            angular.forEach(desks, function (desk, color) {

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

            // Configure a pie/donut chart summing up the desk data
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
        updateProfile: updateProfile,
        getDeskResults: getDeskResults
    };
});

app.controller('ProfileController', function ($scope, ProfileFactory) {
    
    ProfileFactory.getAllUsers();

    ProfileFactory.getDeskResults();
    
    $scope.update = function(user)
    {
        ProfileFactory.updateProfile(user._id, user, function (currentUser) {
            $scope.currentUser = currentUser;
            toastr.success("desk selected!");
        });
    }
    
});

