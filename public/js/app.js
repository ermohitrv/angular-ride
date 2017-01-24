var app = angular.module('ridePrixApp', ['ngSanitize']);

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

/********************** menu controller  **********************/
app.controller('viewController',['$scope', '$http', function ($scope, $http, $location, $routeParams) {
    /*$scope.studentList = [
        {name: "Sandeep", roll: 4, subject: 'Mathematics', mark: 25, age: 23, country: 'India'},
        {name: "Hari", roll: 5, subject: 'Geograph', mark: 35, age: 23, country: 'India'},
        {name: "Ram", roll: 3, subject: 'History ', mark: 45, age: 23, country: 'India'},
        {name: "John", roll: 2, subject: 'Mathematics', mark: 15, age: 25, country: 'UK'},
        {name: "Jim", roll: 1, subject: 'Mathematics', mark: 33, age: 23, country: 'UK'},
        {name: "Kelly", roll: 6, subject: 'Mathematics', mark: 23, age: 23, country: 'US'}
    ];
    $scope.showStudentTable = function(pathurl){

        console.log(pathurl);
        $location.path(pathurl);
    }*/
}]);

/********************** chat controller  **********************/
app.controller('homeController', ['$scope', '$http', function ($scope, $http) {
    /*function to list users homepage */
    $scope.usersList = [];
    $scope.drawUsersMap = function(){
        $http.get('/draw-users-map').success(function(usersList){
            $scope.usersList = usersList;
            
            /*
            var widthScreen = $(document).width();
            if (widthScreen > 768) {
                
                if (window.google && google.maps) {
                    // Map script is already loaded
                    console.log(JSON.stringify(usersList));
                    initializeMap(usersList);
                } else {
                    lazyLoadGoogleMap();
                    initializeMap(usersList)
                }
            }
*/
        }).error(function(){
            console.log('Oops! Error listing get-users-list');
        });
    };
}]);
/********************** menu controller  **********************/
app.controller('menuController',['$scope', '$http', function ($scope, $http) {
        
}]);

app.controller('adminController',['$scope', '$http', function ($scope, $http) {
    /*function to list users in admin panel*/
    $scope.getUsersList = function(){
        $http.get('/admin/get-users-list').success(function(usersList){
            $scope.usersList = usersList;
        }).error(function(){
            console.log('Oops! Error listing get-users-list');
        });
    };
    
    /*function to list products in admin panel*/
    $scope.getProductsList = function(){
        $http.get('/admin/get-products-list').success(function(productsList){
            $scope.productsList = productsList;
        }).error(function(){
            console.log('Oops! Error listing get-users-list');
        });
    };
}]);
