angular.module("coreModule")
/**
*  Directive used for automatic attribute editor creation
*/
.directive("otPostSelector", [
    "$location",
    "$routeParams",
    "dashboardListService",
    "cmsApiService",
    function ($location, $routeParams, DashboardListService, cmsApiService) {
        var serviceList = new DashboardListService(), showColumns;
        showColumns = {
            'identifier' : {'type' : 'select-link'},
            'enabled' : {},
            'title' : {}
        };

        return {
            restrict: "E",
            templateUrl: "/views/core/directives/editor/ot-post-selector.html",

            scope: {
                "attribute": "=editorScope",
                "item": "=item"
            },

            controller: function ($scope) {
                var loadData;

                $scope.mapping = {
                    id: '_id'
                };

                $scope.oldSearch = {};
                
                $scope.getParentName = function () {
                    var name = "";
                    if (typeof $scope.item !== "undefined" &&
                        typeof $scope.items !== "undefined" &&
                        typeof $scope.item[$scope.attribute.Attribute] !== "undefined") {

                        for (var i = 0; i < $scope.items.length; i += 1) {

                            if ($scope.items[i]._id === $scope.item[$scope.attribute.Attribute] ||
                                $scope.items[i]._id === $scope.item.parent) {
                                name = $scope.items[i].title;
                                break;
                            }
                        }
                    }
                    return name;
                };

                $scope.select = function (id) {
                    $scope.item[$scope.attribute.Attribute] = id;
                    $scope.hide($scope.attribute.Attribute);
                };

                $scope.show = function (id) {
                    $("#" + id).modal("show");
                };

                $scope.hide = function (id) {
                    $("#" + id).modal("hide");
                };

                $scope.clear = function () {
                    $scope.item[$scope.attribute.Attribute] = "";
                    $scope.item.parent = "";
                };

                loadData = function () {

                    if (typeof $scope.search === "undefined") {
                        $scope.search = {};
                    }

                    //remove empty query strings
                    for (var k in $scope.search){
                        if (!$scope.search[k] || $scope.search[k] == "~") {
                            delete $scope.search[k]
                        }
                    }

                    /**
                     * Gets list of blogs
                     */
                    var getBlogList = function () {
                        var params = $scope.search;
                        params["extra"] = serviceList.getExtraFields();
                        cmsApiService.blogList(params).$promise.then(
                            function (response) {
                                var result, i;
                                $scope.postTmp = [];
                                result = response.result || [];
                                for (i = 0; i < result.length; i += 1) {

                                    if (result[i]._id !== $scope.item._id) {
                                        $scope.postTmp.push(result[i]);
                                    }
                                }
                            }
                        );
                    };


                    $scope.attributes = [
                        {
                            Attribute: "identifier",
                            Type: "varchar",
                            Label: "Name"
                        },
                        {
                            Attribute:"identifier",
                            Label:"Identifier",
                            Type:"text"
                        },
                        {
                            Attribute:"title",
                            Label:"Title",
                            Type:"text"
                        }
                    ];

                    serviceList.setAttributes($scope.attributes);
                    $scope.fields = serviceList.getFields(showColumns);
                    getBlogList();

                    var prepareList = function () {
                        if (typeof $scope.attributes === "undefined" || typeof $scope.postTmp === "undefined") {
                            return false;
                        }
                        $scope.items = serviceList.getList($scope.postTmp);
                    };

                    $scope.$watch("postTmp", prepareList);
                    $scope.$watch("attributes", prepareList);
                };

                $scope.$watch("search", function () {
                    loadData();
                });

            }
        };
    }]);
