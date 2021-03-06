angular.module("coreModule")
/*
 *  productApiService interaction service
 */
.service("coreApiService", ["$resource", "REST_SERVER_URI", function ($resource, REST_SERVER_URI) {
    return $resource(REST_SERVER_URI, {}, {
        "attributesModel": {
            method: "GET",
            params: {
                "uri_1": "@uri_1",
                "uri_2": "@uri_2",
                "uri_3": "@uri_3",
                "uri_4": "@uri_4",
                "uri_5": "@uri_5"
            },
            url: REST_SERVER_URI + "/:uri_1/:uri_2/:uri_3/:uri_4/:uri_5"
        },
        "productList": {
            method: "GET",
            url: REST_SERVER_URI + "/products"
        },
        "getCount": {
            method: "GET",
            params: { action: "count" },
            url: REST_SERVER_URI + "/products"
        }
    });
}]);