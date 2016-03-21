angular.module("dashboardModule", [
    // Angular
    "ngRoute",
    "ngResource",
    "ngSanitize",

    // Lib
    "ui.odometer",
    "ui.bootstrap",
    "highcharts-ng",

    // Ottemo
    "categoryModule",
    "cmsModule",
    "configModule",
    "designModule",
    "discountsModule",
    "impexModule",
    "loginModule",
    "orderModule",
    "productModule",
    "seoModule",
    "subscriptionsModule",
    "visitorModule"
])

.constant("REST_SERVER_URI", angular.appConfigValue("general.app.foundation_url"))
.constant("COUNT_ITEMS_PER_PAGE", angular.appConfigValue("general.app.item_per_page"))

/*
 *  Basic routing configuration
 */
.config(["$routeProvider", "$httpProvider",'$locationProvider','$sceDelegateProvider', '$animateProvider',
    function ($routeProvider, $httpProvider, $locationProvider, $sceDelegateProvider, $animateProvider) {

        var otInterceptor = ['$q',
            function ($q) {
                return {
                    response: function (response) {
                        if (typeof response.data.error !== "undefined" &&
                            response.data.error !== null &&
                            response.data.error.code === "0bc07b3d-1443-4594-af82-9d15211ed179") {

                            location.replace('/');
                        }
                        if (response.data.error){
                            console.log(response.data.error);
                        }
                        return response;
                    },
                    responseError: function (rejection) {
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
        }];

        $httpProvider.interceptors.push(otInterceptor);

        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            angular.appConfigValue("general.app.foundation_url") + '/**'
        ]);

        $routeProvider
            .when("/", {
                templateUrl: "/views/dashboard/welcome.html",
                controller: "dashboardController"
            })
            .when("/help", {
                templateUrl: "/views/help.html"
            })
            .otherwise({ redirectTo: "/"});

        $locationProvider.html5Mode(true);

        // Don't monitor font awesome animation .fa-spin
        $animateProvider.classNameFilter(/^((?!(fa-spin)).)*$/);
    }]
)

.run([
    "$rootScope",
    "$route",
    "$http",
    "$dashboardListService",
    "$location",
    "$log",
    "$dashboardUtilsService",
    function ($rootScope, $route, $http, DashboardListService,$location,$log,$dashboardUtilsService) {
        // ajax cookies support fix
        $http.defaults.withCredentials = true;
        delete $http.defaults.headers.common["X-Requested-With"];

        $rootScope.$list = new DashboardListService();

        $route.reload();

        $rootScope.$on('$routeChangeError', function (ev, current, previous, rejection) {
            if (rejection && rejection.needsAuthentication === true) {
                // redirect to login page
                $location.url('/login');
            }
        });

        $rootScope.$on('$routeChangeStart', function(e,to,from){
            if (to.originalPath != "/login"){
                to.resolve = to.resolve || {};
                if (!to.resolve.checkLoggedIn){
                    to.resolve.checkLoggedIn =
                        function($q,$loginLoginService){
                            var def = $q.defer();
                            $loginLoginService.init().then(function(auth){
                                if (auth){
                                    def.resolve(auth)
                                } else {
                                    var err = $dashboardUtilsService.getMessage(null, 'danger', 'Authentication required. Redirect to login.');

                                    $rootScope.message = err
                                    $log.error(err.message);
                                    def.reject({ needsAuthentication: true });
                                }
                            })
                            return def.promise;
                        }
                }
            }
        });

        // content loaded handler
        $rootScope.$on('$routeChangeSuccess', function(res){
            $rootScope.contentLoaded = true;
        });
    }
]);
