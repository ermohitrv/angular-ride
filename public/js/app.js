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

/********************** view controller  **********************/
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

/********************** homepage controller  **********************/
app.controller('homeController', ['$scope', '$http', function ($scope, $http) {
    /*function to list users homepage */
    $scope.usersList = [];
    
    /*function to list all users locations on homepage */
    $scope.drawUsersMap = function(){
        $http.get('/draw-users-map').success(function(usersList){
            $scope.usersList = usersList;
            var widthScreen = $(document).width();
            if (widthScreen > 768) {
                
                if (window.google && google.maps) {
                    // Map script is already loaded
                    initializeMap(usersList);
                } else {
                    initializeMap(usersList);
                }
            }
        }).error(function(){
            console.log('Oops! Error listing get-users-list');
        });
    };
}]);

/********************** menu controller  **********************/
app.controller('menuController',['$scope', '$http', function ($scope, $http) {
       
        $scope.cartProducts = function(){
            $scope.cartProductsCount = 0;
            var config = {
               
                headers : {'Accept' : 'application/json'}
            };
            $http.post('/product/cartproducts',config).success(function (response, status, headers, config){
            if(response.total_cart_items > 0){
                $scope.cartProductsCount = response.total_cart_items;
            }else{
               
                $scope.cartProductsCount = 0;
            }
                //$("#cart-badge").html(response.total_cart_items);
                //console.log(response);

            }).error(function(err){
               console.log('Oops! Error occur'+err);
            }); 
       };
    
       
//            $scope.complete=function(){
//                  alert("sdsds");
//                    console.log(availableTags);
//                     angular.element(document).ready(function () {
//                        $( "#tags" ).autocomplete({
//                          source: availableTags,
//                        });
//                 });
//            } ;
            
            angular.element(document).ready(function () {
              
//                    $( "#search-box" ).autocomplete({
//                          source: availableTags,
//                        });
                $( "#search-box" ).autocomplete({
                    source: '/autocomplete-search',

                }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
                       var productlink = "/product/"+item.product_link;
                       ul.addClass('search-product-list');
                       return $( "<li>" )
                      .append( '<a href='+productlink+'><span>'+item.product_title+'</span></a>' )
                       .appendTo( ul );
                    };
            });

}]);

/********************** profile controller  **********************/
app.controller('profileController',['$scope', '$http', function ($scope, $http) {
    /* function to render country selected for selectbox */
    $scope.renderCountry = function(country){
        $scope.selectedOption = country;
    };
    /* function to enable/disable user account */
    $scope.enable_disable_account = function(){
        var config = {
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/enable-disable-account',config).success(function (response, status, headers, config){
            console.log(response);
            
        }).error(function(err){
           console.log('Oops! Error occur'+err);
        });  
    };
}]);

/********************** product controller  **********************/
app.controller('productController',['$scope', '$http','$sce', function ($scope, $http, $sce) {
    /* function to render product detail */
    $scope.productDetail = function(productId){
        $http.get('/product/shop/products-detail/'+productId).success(function(view){
            var text = $sce.trustAsHtml(view);
            $scope.productDetailView = text;
        }).error(function(){
            console.log('Oops! Error listing products-detail');
        });
    };
    
    /* function to list all related products */
    $scope.relatedProducts = function(){
        $http.get('/product/shop/related-products-list').success(function(view){
            $scope.relatedProductsView = view;
        }).error(function(){
            console.log('Oops! Error listing related-products-list');
        });
    };
    
    /* function to add item to the cart */
    $scope.addToCart = function(productId,quantity_box){
        console.log(productId,quantity_box);
        var data = { 
            product_id: productId, 
            product_quantity: quantity_box
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/product/addtocart',config).success(function (response, status, headers, config){
           
            $("#cart-badge").html(response.total_cart_items);
            //alert(response.message);
            console.log(response);
           
        }).error(function(err){
           console.log('Oops! Error occur'+err);
        }); 
    };
    
    
     $scope.imageResize = function(imageSrc){
        alert(imageSrc);
        var data = { 
            image_src: imageSrc, 
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/product/imageresize',config).success(function (response, status, headers, config){
           alert("success"+response.success);
            //console.log(response);
           
        }).error(function(err){
           console.log('Oops! Error occur'+err);
        }); 
        
//        $http.get('/product/imageresize').success(function(response){
//          alert("success"+response.success);
//        }).error(function(){
//            console.log('Oops! Error listing products-detail');
//        });
    };
     
}]);


app.controller('cartController',['$scope', '$http','$sce', function ($scope, $http, $sce) {
        
        /* function to remove product from cart */
        $scope.removeFromCart = function(rowid,productId){
        
        $http.get('/product/removefromcart/'+productId).success(function(response){
           $("#cart-badge").html(response.total_cart_items);
            $("#cart_checkoutpage").load(location.href + " #cart_checkoutpage");
        }).error(function(){
            console.log('Oops! Error listing products-detail');
        });
      
    };
        
}]);

/********************** shop controller  **********************/
app.controller('shopController',['$scope', '$http', '$sce',function ($scope, $http,$sce) {
    /* function to render all published products into shop section */
    $scope.shopProductsList = function(){
        $http.get('/product/shop/products-list').success(function(view){
            var text = $sce.trustAsHtml(view);
            $scope.shopProductsListView = text;
            //$scope.shopProductsListView = view;
        }).error(function(){
            console.log('Oops! Error listing products-list');
        });
    };
    
     $scope.addToCartfromshop = function(productId,quantity_box){
       
        var data = { 
            product_id: productId, 
            product_quantity: quantity_box
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/product/addtocart',config).success(function (response, status, headers, config){
           
            $("#cart-badge").html(response.total_cart_items);
            //alert(response.message);
            console.log(response);
      
        }).error(function(err){
           console.log('Oops! Error occur'+err);
        }); 
    };
    
    
}]);

/********************** admin controller  **********************/
app.controller('adminController',['$scope', '$http','$sce', function ($scope, $http, $sce) {
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
    
    /*function to list brands in admin panel*/
    $scope.getBrandsList = function(){
        $http.get('/admin/get-brands-list').success(function(brandsList){
            $scope.brandsList = brandsList;
        }).error(function(){
            console.log('Oops! Error listing get-brands-list');
        });
    };
    
    /*function to view users in admin panel*/
    $scope.getUserDetail = function(id){
        var data = { 
            user_id: id
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/admin/view-user-detail',config).success(function (response, status, headers, config){
            var text = $sce.trustAsHtml(response);
            $scope.enableAccount = "";
            $scope.userDetailView = response;
        }).error(function(err){
           console.log('Oops! Error occur'+err);
        }); 
    };
    
    /*function to view users in admin panel*/
    $scope.enableDisableUserAccount = function(username){
        var data = { 
            username: username
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/admin/enable-disable-user-account',config).success(function (response, status, headers, config){
            if(response.enableAccount == true){
                $scope.enableAccount = 'Enabled';
            }else{
                $scope.enableAccount = 'Disabled';
            }
            
        }).error(function(err){ 
           console.log('Oops! Error occur'+err);
        }); 
    };
}]);

app.directive('bindUnsafeHtml', ['$compile', function ($compile) {
      return function(scope, element, attrs) {
          scope.$watch(
            function(scope) {
              // watch the 'bindUnsafeHtml' expression for changes
              return scope.$eval(attrs.bindUnsafeHtml);
            },
            function(value) {
              // when the 'bindUnsafeHtml' expression changes
              // assign it into the current DOM
              element.html(value);
              // compile the new DOM and link it to the current
              // scope.
              // NOTE: we only compile .childNodes so that
              // we don't get into infinite loop compiling ourselves
              $compile(element.contents())(scope);
            }
        );
    };
}]);