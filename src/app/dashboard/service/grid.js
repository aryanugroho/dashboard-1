angular.module('dashboardModule')

    .service('dashboardGridService', [
        '_',
        '$q',
        'dashboardGridApiService',
        'dashboardQueryService',
        function (
            _,
            $q,
            dashboardGridApiService,
            dashboardQueryService
        ) {

        var ITEMS_PER_PAGE = 15;

        var defaults = {

            /**
             * Default grid columns
             * Each columns is object with properties:
             *      key
             *      label       - column title,
             *      type        - value type,
             *      editor      - filter type,
             *      isSortable  - column is sortable
             *      isLink      - {Boolean} column value is wrapped with <a> element
             *                              with 'href' = row._link
             */
            columns: [
                {
                    key: 'image',
                    label: 'Image',
                    type: 'image'
                },
                {
                    key: 'id',
                    label: 'ID',
                    type: 'text',
                    editor: 'text',
                    isLink: true
                },
                {
                    key: 'name',
                    label: 'Name',
                    type: 'text',
                    editor: 'text'
                },
                {
                    key: 'description',
                    label: 'Description',
                    type: 'text',
                    editor: 'text'
                }
            ],

            /**
             * Default mapping object
             * defines how value for each column is obtained from collection item
             * field: { ID: 'id' }                  item.ID -> column 'id'
             * extra: { customer_email: 'email' }   item.Extra.customer_email -> column 'email'
             *
             * It may make filters, that are visible in view, be different from filters, that are sent to the server
             * in view:                     email=~ottemo
             * actual filter in request:    customer_email=~ottemo
             */
            mapping: {
                field: {
                    ID: 'id',
                    Image: 'image',
                    Name: 'name',
                    Desc: 'description'
                },
                extra: {}
            },

            /**
             * Initial search params object
             * may contain filters, sort and limit parameters
             * { sort: '^created_at', limit: '10,25' }
             *
             * Used to initialize grid with parameters of page url
             */
            searchParams: {},

            /**
             * Additional extra parameters that are passed to the server and can be used in rowCallback
             * e.g: 'weight,price'
             */
            forcedExtra: '',

            /**
             * Filters that are not visible in view and always passed to the server
             * e.g.:
             * { status=processed } - users are not allowed to change that filter, but it will be send to the server
             */
            forcedFilters: {},

            itemsPerPage: ITEMS_PER_PAGE,

            /**
             * callback or an array of callbacks that are invoked for each row in grid
             * callback parameters:
             *      row - row object
             *      key - entity index in collection
             *      collection
             */
            rowCallback: null
        };

        /**
         * Constructor
         */
        function Grid(settings) {
            var config = _.assign({}, defaults, settings);

            this.collection = config.collection;
            this.columns = config.columns;
            this.applyMapping(config.mapping);
            this.rowCallback = config.rowCallback;
            this.limit = {
                start: dashboardQueryService.limitStartFromString(config.searchParams.limit),
                perPage: config.itemsPerPage
            };
            this.forcedExtra = config.forcedExtra;
            this.forcedFilters = config.forcedFilters;
            this.initFilters();
            this.applyFilters(config.searchParams);
            this.setSort(config.searchParams.sort);
        }

        /**
         * Methods
         */
        Grid.prototype = {

            /**
             * Loads collection and converts each collection item into grid row item
             */
            load: function() {
                var loadDeferred = $q.defer();
                var self = this;
                var apiLoadCollection = dashboardGridApiService[this.collection + 'List'];

                apiLoadCollection(this.getRequestParams()).$promise
                    .then(function(response) {
                        if (response.error === null) {

                            var rows = [];
                            _.forEach(response.result, function(entity, key, collection) {
                                var row = self.convertEntityToRow(entity);

                                // Apply callbacks to each row
                                var rowCallbacks = self.rowCallback;
                                if (rowCallbacks) {
                                    if (!(rowCallbacks instanceof Array)) {
                                        rowCallbacks = [rowCallbacks]
                                    }
                                    _.forEach(rowCallbacks, function(callback) {
                                        var result = callback.call(self, row, key, collection);
                                        if (result !== undefined) {
                                            row = result;
                                        }
                                    });
                                }

                                rows.push(row);
                            });

                            loadDeferred.resolve(rows);

                        } else {
                            loadDeferred.reject(null);
                        }
                    }, function() {
                        loadDeferred.reject(null);
                    });


                return loadDeferred.promise;
            },

            /**
             * Returns parameters object for api call
             */
            getRequestParams: function() {
                var requestFilterParams = this.getRequestFiltersParams();
                var params = _.assign({}, requestFilterParams, this.forcedFilters);
                var extraParam = this.getRequestExtraParam();
                if (extraParam !== '') {
                    params.extra = extraParam;
                }
                var sortParam = this.getRequestSortParam();
                if (sortParam !== '') {
                    params.sort = sortParam;
                }
                params.limit = dashboardQueryService.limitToString(this.limit);

                return params;
            },

            /**
             * Converts collection entity into row item accordingly to mapping
             */
            convertEntityToRow: function(entity) {
                var row = {};

                _.forEach(this.mapping.field, function(columnKey, entityKey) {
                   row[columnKey] = entity[entityKey];
                });

                if (entity.Extra !== null) {
                    _.forEach(this.mapping.extra, function(columnKey, extraKey) {
                        row[columnKey] = entity.Extra[extraKey]
                    });
                }

                return row;
            },

            /**
             * Return count of collection items
             */
            count: function() {
                var countDeferred = $q.defer();
                var apiGetCount = dashboardGridApiService[self.collection + 'Count'];

                apiGetCount(this.getRequestParams()).$promise
                    .then(function(response) {
                        if (response.error === null && response.result !== null) {
                            countDeferred.resolve(response.result);
                        } else {
                            countDeferred.reject(null);
                        }
                    }, function() {
                        countDeferred.reject(null);
                    });

                return countDeferred.promise;
            },

            /**
             * Init filters for each column
             */
            initFilters: function() {
                var filters = [];
                _.forEach(this.columns, function(column) {
                    var filter = {};
                    filter.type = column.editor || 'not_editable';
                    filter.key = column.key;
                    filter.entityKey = column.entityKey;
                    filters.push(filter);
                });

                this.filters = filters;
            },

            /**
             *  Apply filters from params object
             *  { size: '~small' } -> filter { key: 'size', value: '~small' }
             */
            applyFilters: function(params) {
                _.forEach(this.filters, function(filter) {
                    if (params[filter.key] !== undefined) {
                        filter.value = params[filter.key];
                    }
                })
            },

            /**
             *  Returns an object of filters key-values that can be shown in the view
             */
            getColumnsFiltersParams: function() {
                var filtersParams = {};
                _.forEach(this.filters, function(filter) {
                    if (filter.value !== undefined) {
                        filtersParams[filter.key] = filter.value;
                    }
                });

                return filtersParams;
            },

            /**
             * Returns an object of filters key-values that are sent to the server in a request
             */
            getRequestFiltersParams: function() {
                var filtersParams = {};
                _.forEach(this.filters, function(filter) {
                    if (filter.value !== undefined) {
                        filtersParams[filter.entityKey] = filter.value;
                    }
                });

                return filtersParams;
            },

            /**
             * Assign sort parameter defined in search parameters to a grid column
             * search: { sort: 'name' } -> column { key: 'name', ... , sort: 'ASC' }
             */
            setSort: function(sortStr) {
                var sort = dashboardQueryService.sortFromString(sortStr);
                if (sort !== null) {
                    var column = _.filter(this.columns, { key: sort.column})[0];
                    if (column) {
                        column.sort = sort.direction;
                    }
                }
            },

            /**
             * Return current sort parameter as a string
             * column { key: 'name', ... , sort: 'DESC' } -> '^name'
             */
            getColumnSortParam: function() {
                var sortParam = '';
                _.forEach(this.columns, function(column) {
                    if (column.sort) {
                        sortParam = dashboardQueryService.sortToString({ column: column.key, direction: column.sort });
                        return false;
                    }
                });

                return sortParam;
            },


            getRequestSortParam: function() {
                var sortParam = '';
                _.forEach(this.columns, function(column) {
                    if (column.sort) {
                        sortParam = dashboardQueryService.sortToString({ column: column.entityKey, direction: column.sort });
                        return false;
                    }
                });

                return sortParam;
            },

            /**
             * Applies mapping to grid columns
             * adds to each column 'entityKey' - actual field key in collection entity,
             * from which column value is obtained
             */
            applyMapping: function(mapping) {
                var self = this;
                _.forEach(mapping.field, function(columnKey, entityKey) {
                    var column = _.filter(self.columns, { key: columnKey })[0];
                    if (column) {
                        column.entityKey = entityKey;
                    }
                });
                _.forEach(mapping.extra, function(columnKey, entityKey) {
                    var column = _.filter(self.columns, { key: columnKey })[0];
                    if (column) {
                        column.entityKey = entityKey;
                    }
                });

                this.mapping = mapping;
            },

            /**
             * Returns extra parameter for a request
             */
            getRequestExtraParam: function() {
                var forcedExtra = this.forcedExtra.split(',');
                var extra = Object.keys(this.mapping.extra);
                return extra.concat(forcedExtra).join(',');
            },

            /**
             * Returns search parameters that are shown in the view
             */
            getViewSearchParams: function() {
                var params = this.getColumnsFiltersParams();
                var sortParam = this.getColumnSortParam();
                if (sortParam !== '') {
                    params.sort = sortParam;
                }
                params.limit = dashboardQueryService.limitToString(this.limit);

                return params;
            }
        };

        return {
            grid: function(settings) {
                return new Grid(settings);
            }
        }
    }]);