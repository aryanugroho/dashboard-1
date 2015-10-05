angular.module("designModule")
/**
*  Directive used for automatic attribute editor creation
*/
.directive("guiFilterDate", ["$designService", function ($designService) {
    return {
        restrict: "E",
        scope: {
            "parent": "=object",
            "attribute": "=editorScope",
            "item": "=item"
        },
        templateUrl: $designService.getTemplate("design/gui/filter/date.html"),

        controller: ["$scope", function ($scope) {
            $scope.hightInvalid = false;
            $scope.lowInvalid = false;
            $scope.low;
            $scope.hight;
            var regExpNumber = /^\s*[0-9]*\s*$/;
            var isInit = false;


            $scope.submit = function(){
            	$scope._low = Math.round(+$scope.low/1000);
                $scope._hight = Math.round(+$scope.hight/1000);
                if ("" === $scope.low && "" === $scope.hight) {
                    $scope.item[$scope.attribute.Attribute] = "";
                    $scope.parent.newFilters[$scope.attribute.Attribute] = $scope.item[$scope.attribute.Attribute];
                } else {
                    $scope.item[$scope.attribute.Attribute] = ($scope._low || "") + ".." + ($scope._hight || "");
                    $scope.parent.newFilters[$scope.attribute.Attribute] = $scope.item[$scope.attribute.Attribute];
                }
            }

            $scope.$watch("item", function () {
                if (typeof $scope.item === "undefined") {
                    return false;
                }
                if (isInit || typeof $scope.item[$scope.attribute.Attribute] === "undefined") {
                    return false;
                }

                var value = $scope.item[$scope.attribute.Attribute];
                var regExp = new RegExp("(\\d*)\\.\\.(\\d*)$", "i");
                var values = value.match(regExp);
                if (null !== values) {
                    $scope.low = new Date(values[1]*1000);
                    $scope.hight = new Date(values[2]*1000);
                    isInit = true;
                }

                $scope.parent.newFilters[$scope.attribute.Attribute] = $scope.item[$scope.attribute.Attribute];

            }, true);

        }]
    }
}]);