  angular.module('orderController', ["chart.js"])
      .controller('orderController', ['$scope', '$http', '$interval' , 'googleService',
                                       'mongooseService', 'statsService', 'Flash', 'socket',
            function($scope, $http, $interval, googleService,
                        mongooseService, statsService, Flash, socket) {

          $scope.employeeId = "";
          $scope.name = "";
          $scope.idCard = "";
          $scope.successMessage = false;
          $scope.placedOrder = false;
          var users = {};
          var dayInMilliseconds = 86400000;
          $scope.idCardDetails = "";

          $http({method: 'GET', url: 'data/order.json'}).
              success(function(data) {
                  $scope.colours = data.juices;
          });

          $http({method: 'GET', url: 'data/users.json'}).
                        success(function(data) {
                            users = data;
          });

          $interval(function() {
                googleService.getStats()
                             .then(_updateMongo)
                             .then(_cleanSpreadSheet)
           }, dayInMilliseconds);

          $scope.placeOrder = function() {
            if(_validateOrder()) {
              $scope.placedOrder = true;
              $scope.missingFields = false;
              googleService.create(_constructOrder())
                      .then(_notifySuccess);
            } else {
              _notifyError();
            }
          };

          socket.on('data', function(data) {
                $scope.idCardDetails = parseInt(data.msg);
                var user = users[$scope.idCardDetails];
                $scope.name  = user && user.Name;
                $scope.employeeId = user && user.EmployeeId;
                $scope.idCardDetails = "";
          });


          var _constructOrder = function() {
             var date = _getTodayDate();
             return {
                  'Name' : $scope.name,
                  'EmployeeId': $scope.employeeId,
                  'Order': $scope.selected,
                  'Date': date
             }
          }

          var _notifySuccess = function(response) {
             var message = '<strong>Thank you!</strong> We successfully placed your Order';
             Flash.create('success', message, 'col-sm-4 col-sm-offset-4');
             $scope.successMessage = true;
             $scope.placedOrder = false;
             resetDefaults();
          }

          var _notifyError = function(response) {
             $scope.successMessage = false;
             var message = '<strong>Error!</strong> Mandatory fields are missing';
             Flash.create('danger', message, 'col-sm-4 col-sm-offset-4');
             $scope.missingFields = true;

          }

          var resetDefaults = function() {
             $scope.name  = "";
             $scope.employeeId = "";
             $scope.selected = "";
          }

          var _validateOrder = function() {
            return  $scope.selected  && $scope.name && $scope.employeeId ;
          }

          var _getTodayDate = function() {
             var today = new Date();
             return today.getDate() + '/' + today.getMonth() + '/' + today.getFullYear();
          }

          var _updateMongoAndCleanSpreadSheet = function(response) {
                  mongooseService
                          .update(statsService.getDetails(response.data).shift())
          }

          var _cleanSpreadSheet = function() {
            googleService.deleteContents();
          }
  }]);