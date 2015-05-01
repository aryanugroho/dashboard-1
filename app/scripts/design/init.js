
angular.getTheme = function (path) {

return function () {
    var template, tpl;
    tpl = "/views/" + path;

    if (angular.isExistFile) {
        template = "themes/" + angular.appConfigValue("themes.list.active") + tpl;
    } else {
        template = "themes/default" + tpl;
    }

    return template;
};
};

/**
*  Angular "designModule" allows to use themes
*
*  default [themeName] is blank
*  Usage:
*      <ng-include src="getTemplate("dashboard/footer.html")" />
*      i.e. - getTemplate("someTemplate.html") = views/[themeName]/someTemplate.html
*
*/

angular.module("designModule",[])

.constant("MEDIA_BASE_PATH", angular.appConfigValue("general.app.media_path"))
.constant("PRODUCT_DEFAULT_IMG", "placeholder.png")

/**
 *  Startup for designModule - registration globally visible functions
 */
.run(["$designService", "$rootScope", function ($designService, $rootScope) {

    /**
     *  Global functions you can use in any angular template
     */
    $rootScope.setTheme = $designService.setTheme;
    $rootScope.getTemplate = $designService.getTemplate;
    $rootScope.getTopPage = $designService.getTopPage;
    $rootScope.getCss = $designService.getCssList;
    $rootScope.getImg = $designService.getImage;

}]);
