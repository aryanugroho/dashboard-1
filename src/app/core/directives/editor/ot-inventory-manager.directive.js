angular.module('coreModule')

.directive('otInventoryManager', ['_', function(_) {
    return {
        restrict: 'E',
        scope: {
            'options': '=',
            'inventory': '=',
            'qty': '=',
        },
        templateUrl: '/views/core/directives/editor/ot-inventory-manager.html',
        link: function(scope, el, attr){

            //TODO: What do we do when we have inventory being passed in
            scope.$watch('options', updateOptions, true);

            //////////////////////

            function updateOptions() {
                console.log('option update cycle');
                scope.inventory = findPermutations(formatOptions(scope.options));
            }

            function formatOptions(options){
                return _.chain(options)
                    .forEach(function addCodeField(o, code){
                        o.code = code;
                    })
                    .filter('controls_inventory')
                    .map(function formatOption(o){
                        var it = {
                            code: o.code,
                            selections: _.keys(o.options)
                        };
                        return it;
                    })
                    .value();
            }


            /**
             * var options = [
             *   {code: "color",     selections: ["red", "blue", "green", "yellow"]}, // color
             *   {code: "size",      selections: ["small", "medium", "large"]},       // size
             *   {code: "thickness", selections: ["heavy", "light"]},                 // thickness
             * ];
             */
            function findPermutations(options) {
                var resp = [];

                // kick off the recursion
                if (options.length) {
                    recur(options);
                }
                return resp;

                ////////////////

                function recur(choices, aggr) {
                    var aggr = aggr || {}; // aggregator

                    // We hit the bottom of our recursion
                    if (!choices.length) {
                        // write out to outer variable
                        resp.push({options:aggr});
                        return aggr;
                    }

                    // always loop over the first item we are given
                    for (var c = 0; c < choices[0].selections.length; c++) {
                        // Copy it so that we don't just keep over-writing our data
                        var newAggr = angular.copy(aggr);

                        // remove the first option and pass it back in
                        // pass the remaining choices
                        newAggr[choices[0].code] = choices[0].selections[c];
                        recur(choices.slice(1), newAggr);
                    }
                }
            }

        }
    };
}]);

