var app = angular.module('motorApp', ['ngSanitize']);

app.filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);

app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});

app.filter('stripperiod', function () {
    return function (input) {
        return input.replace('.', '');
    };
});

app.filter('containsstring', function() {
    return function (array, needle) { 
        console.log('hey'+JSON.stringify( array ));
        return array.indexOf(needle) >= 0;
    };
});

/********************** chat controller  **********************/
app.controller('chatController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

}]);
/********************** menu controller  **********************/
app.controller('menuController',['$scope', '$http', function ($scope, $http) {
        
}]);


