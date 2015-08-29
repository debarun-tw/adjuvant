angular.module('adjuvant').directive('dropdown', function() {

    return {
        restrict: 'AE',
        replace: 'true',
        templateUrl: "/partials/dropdown.html",
        scope: {
        			placeholder: "@",
        			list: "=",
        			selected: "=",
        			property: "@"
        		},
         link: function(scope) {

          			scope.listVisible = true;
          			scope.isPlaceholder = true;

//                    scope.example = {
//                            word: /^[a-z]+[@+!+#][a-z]*$/
//                     };

          			scope.add = function (newValue) {
                            scope.list.push(newValue);
                            scope.selected = newValue
                    }

          			scope.$watch("selected", function(value) {
          				scope.selectedItem = value;
          				scope.display = scope.selected;
          			});
          		}
         }

  });



