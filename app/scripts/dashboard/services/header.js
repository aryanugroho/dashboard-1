(function (define) {
    "use strict";

    /*
     *  HTML top page header manipulation stuff
     */
    define([
            "dashboard/init"
        ],
        function (dashboardModule) {

            var getParentItem, parentItem, transformMenu, i;
            getParentItem = function (data, field, value) {
                for (i = 0; i < data.length; i += 1) {
                    if (data[i][field] === value) {
                        parentItem = data[i];
                    }
                    var $subList = data[i].items;
                    if ($subList) {
                        getParentItem($subList, field, value);
                    }
                }

                return parentItem;
            };

            /**
             * Transforms simple array with menu items to the object array which includes array subitems
             * and returns this array
             *
             * @param menu
             * @returns {Array}
             */
            transformMenu = function (menu) {
                var item, parentPath, tmpMenu, i;
                tmpMenu = [];
                menu.sort(function (obj1, obj2) {
                    return obj2.path < obj1.path;
                });

                for (i = 0; i < menu.length; i += 1) {
                    parentItem = undefined;
                    item = menu[i];
                    /**
                     * Item belongs to the upper level.
                     * He has only one level in path
                     */
                    if (item.path.split("/").length <= 2) {
                        tmpMenu.push(item);
                    } else {
                        /**
                         * Gets from path parent path
                         * Exaample:
                         * for this item with path
                         * /item_1/sub_item_1/sub_item_1_1
                         *
                         * parent item should have path
                         * /item_1/sub_item_1
                         *
                         * @type {string}
                         */
                        parentPath = item.path.substr(0, item.path.lastIndexOf("/"));
                        if (getParentItem(menu, "path", parentPath)) {
                            if (typeof parentItem.items === "undefined") {
                                parentItem.items = [];
                            }
                            parentItem.items.push(item);
                        }
                    }
                }
                return tmpMenu;
            };

            dashboardModule
                /*
                 *  $pageHeaderService implementation
                 */
                .service("$pageHeaderService", ["$loginService", function ($loginService) {

                    var it = {
                        username: $loginService.getUsername(),
                        menuLeft: [],
                        menuRight: []
                    };

                    return {
                        isLogined: function () {
                            return $loginService.isLogined();
                        },

                        getUsername: function () {
                            return it.username;
                        },

                        logout: function () {
                            $loginService.logout();
                        },

                        /**
                         * Adds the item to the right(user) menu
                         *
                         * @param {string} path
                         * @param {string} label
                         * @param {string} link
                         */
                        addMenuRightItem: function (path, label, link) {
                            var item = {path: path, label: label, link: link};
                            it.menuRight.push(item);
                        },

                        getMenuRight: function () {
                            return transformMenu(it.menuRight);
                        },

                        /**
                         * Adds the item to the top menu
                         *
                         * @param {string} path
                         * @param {string} label
                         * @param {string} link
                         */
                        addMenuItem: function (path, label, link) {
                            var item = {path: path, label: label, link: link};
                            it.menuLeft.push(item);
                        },

                        getMenuLeft: function () {
                            return transformMenu(it.menuLeft);
                        }
                    };
                }]);

            return dashboardModule;
        });

})(window.define);
