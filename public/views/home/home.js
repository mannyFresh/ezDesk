app.controller("HomeController", function($scope, $modal, $http, $log) {
	   $scope.open = function (size) {

    var modalInstance = $modal.open({
      templateUrl: 'myHomeModalContent.html',
      controller: 'ModalHomeInstanceCtrl',
      size: size,
    });

    modalInstance.result.then(function (selectedItem) {
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
});

angular.module('ui.bootstrap').controller('ModalHomeInstanceCtrl', function ($scope, $modalInstance, $http, $location) {
  $scope.loginOrRegister = function (path) {
    $modalInstance.close();
    $location.path(path);
  };

});