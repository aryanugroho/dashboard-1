angular.module("dashboardModule", [
    "ngRoute",
    "ngResource",
    "ngSanitize",
    "ngAnimate",
    "ngCookies",
    "loginModule",
    "designModule",
    "categoryModule",
    "cmsModule",
    "configModule",
    "impexModule",
    "orderModule",
    "productModule",
    "seoModule",
    "visitorModule"
])

.constant("REST_SERVER_URI", angular.appConfigValue("general.app.foundation_url"))
.constant("COUNT_ITEMS_PER_PAGE", angular.appConfigValue("general.app.item_per_page"))

/*
 *  Basic routing configuration
 */
.config(["$routeProvider", "$httpProvider", function ($routeProvider, $httpProvider) {
    $httpProvider.interceptors.push(function ($q) {
        return {
            'response': function (response) {
                if (typeof response.data.error !== "undefined" &&
                    response.data.error !== null &&
                    response.data.error.code === "0bc07b3d-1443-4594-af82-9d15211ed179") {
                    location.replace('/');
                }
                return response;
            },
            'responseError': function (rejection) {
                switch (rejection.status) {
                    case 401:
                        location.reload();
                        break;
                    case 404:
                        console.warn("The server is unable to process this request - " + rejection.config.url);
                        break;
                }
                return $q.reject(rejection);
            }
        };
    });
    $routeProvider
        .when("/", {
            templateUrl: angular.getTheme("dashboard/welcome.html"),
            controller: "dashboardController"
        })
        .when("/help", { templateUrl: angular.getTheme("help.html")})

        .otherwise({ redirectTo: "/"});
}])

.run([
    "$rootScope",
    "$route",
    "$http",
    "$designService",
    "$dashboardSidebarService",
    "$dashboardListService",
    function ($rootScope, $route, $http, $designService, $dashboardSidebarService, DashboardListService) {
        // ajax cookies support fix
        $http.defaults.withCredentials = true;
        delete $http.defaults.headers.common["X-Requested-With"];

        $dashboardSidebarService.addItem("/dashboard", "Dashboard", "", "fa fa-home", 100);

        $rootScope.$list = new DashboardListService();

        $route.reload();
    }
]);