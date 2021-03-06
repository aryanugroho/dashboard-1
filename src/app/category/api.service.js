angular.module('categoryModule')
/*
*  productApiService interaction service
*/
.service('categoryApiService', ['$resource', 'REST_SERVER_URI', function ($resource, REST_SERVER_URI) {
    return $resource(REST_SERVER_URI, {}, {
        'attributesInfo': {
            method: 'GET',
            url: REST_SERVER_URI + '/categories/attributes'
        },
        'getCategory': {
            method: 'GET',
            url: REST_SERVER_URI + '/category/:categoryID'
        },
        'categoryList': {
            method: 'GET',
            url: REST_SERVER_URI + '/categories'
        },
        'getCount': {
            method: 'GET',
            params: { action: 'count' },
            url: REST_SERVER_URI + '/categories'
        },
        'save': {
            method: 'POST',
            url: REST_SERVER_URI + '/category'
        },
        'remove': {
            method: 'DELETE',
            url: REST_SERVER_URI + '/category/:categoryID'
        },
        'update': {
            method: 'PUT',
            params: { categoryID: '@id' },
            url: REST_SERVER_URI + '/category/:categoryID'
        },
        'removeImage': {
            method: 'DELETE',
            url: REST_SERVER_URI + '/category/:categoryID/media/image/:mediaName'
        },
        // http://stackoverflow.com/questions/13963022/angularjs-how-to-implement-a-simple-file-upload-with-multipart-form
        'addImage': {
            method: 'POST',
            params: { categoryID: '@categoryId', mediaName: '@mediaName' },
            url: REST_SERVER_URI + '/category/:categoryID/media/image/:mediaName',

            headers: {'Content-Type': undefined },
            transformRequest: angular.identity // jshint ignore:line
        },
        'listImages': {
            method: 'GET',
            url: REST_SERVER_URI + '/category/:categoryID/media/image'
        },
        // Products
        'addProduct': {
            method: 'POST',
            params: {
                // this is a post method, but we don't really care about the data as much
                // as the params, the `@` extracts the param values from the post data
                // so that we don't have to write `addProduct({},params)
                categoryID: '@categoryID',
                productID: '@productID'
            },
            url: REST_SERVER_URI + '/category/:categoryID/product/:productID'
        },
        'removeProduct': {
            method: 'DELETE',
            url: REST_SERVER_URI + '/category/:categoryID/product/:productID'
        },
        'getProducts': {
            method: 'GET',
            url: REST_SERVER_URI + '/category/:categoryID/products'
        }
    });
}]);
