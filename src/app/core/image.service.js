angular.module("coreModule")

.factory("coreImageService", [
    "MEDIA_BASE_PATH",
    function (MEDIA_BASE_PATH) {

        var service = {
            getImage: getImage,
        };

        return service;

        ////////////////////

        function getImage(filename) {
           return MEDIA_BASE_PATH + filename;
        }
    }
]);
