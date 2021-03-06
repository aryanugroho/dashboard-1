angular.module('productModule')

    .controller('productSwatchListController', [
        '_',
        '$scope',
        'productApiService',
        'coreConfirmService',
        'dashboardUtilsService',
        function(
            _,
            $scope,
            productApiService,
            coreConfirmService,
            dashboardUtilsService
        ) {
            // File upload
            $scope.upload = {
                isInProgress: false,
                files: '',
                message: undefined,
                upload: upload
            };

            activate();

            ///////////////////////////

            function activate() {
                getSwatches();
            }

            function getSwatches() {
                return productApiService.listSwatches().$promise
                    .then(function(response) {
                        if (response.error === null) {
                            $scope.swatches = response.result;
                        }
                });
            }

            function upload() {
                $scope.upload.isInProgress = true;
                $scope.upload.message = undefined;
                var postData = new FormData();
                _.forEach($scope.upload.files, function(file) {
                    postData.append('file', file);
                });

                productApiService.addSwatch(postData).$promise
                    .then(function(response) {
                        $scope.upload.files = '';
                        $scope.upload.isInProgress = false;
                        if (response.error === null) {
                            getSwatches();
                            $scope.upload.message = { message: 'Image was uploaded!'};
                        } else {
                            $scope.upload.message = dashboardUtilsService.getMessage(response);
                        }
                    });
            }

            $scope.selectImage = function(index) {
                $scope.selectedItemIndex = index;
            };

            $scope.removeItem = function(swatchItem) {
                var modalMessage = 'Do you really want to remove ' + swatchItem.name + ' ?';
                coreConfirmService.openModal({ message: modalMessage }).result
                    .then(function() {
                        productApiService.removeSwatch({'mediaName': swatchItem.name}).$promise
                            .then(function() {
                                getSwatches();
                                $scope.upload.message = {message: swatchItem.name + ' was removed!'};
                            });
                    });
            };

    }]);