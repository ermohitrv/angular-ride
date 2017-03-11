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

app.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
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
                    initializeMap(usersList,"usermap");
                } else {
                    initializeMap(usersList,"usermap");
                }
            }
        }).error(function(){
            console.log('Oops! Error listing get-users-list');
        });
    };
    
    
     /*function to list all events locations on homepage */
    $scope.eventsList = [];
    $scope.drawEventsMap = function(eventmonth){
        alert("dfsfs");
        $http.get('/draw-events-map/'+eventmonth).success(function(eventsList){
            console.log(eventsList);
            $scope.eventsList = eventsList;
            var widthScreen = $(document).width();
            if (widthScreen > 768) {
                
                if (window.google && google.maps) {
                    // Map script is already loaded
                    initializeMap(eventsList,"eventsmap");
                } else {
                    initializeMap(eventsList,"eventsmap");
                }
            }
        }).error(function(){
            console.log('Oops! Error listing get-events-list');
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
    
        angular.element(document).ready(function () {

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
    /* get categories list on search page */
    $scope.getCategoriesListonsearch = function(){
        
        var config = {
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/product/get-categories-list',config).success(function(response, status, headers, config){
            
            $scope.categoryList = response;
        }).error(function(){
            console.log('Oops! Error listing get-category-list on search page');
        });
    };
    
    /* get brands list on search page */
    $scope.getBrandsListonsearch = function(){
        
        var config = {
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/product/get-brands-list',config).success(function(response, status, headers, config){
            
            $scope.brandList = response;
        }).error(function(){
            console.log('Oops! Error listing get-brands-list on search page');
        });
    };
    
    
//    $scope.filtercheckboxsearch = function(Title){
//       
//        alert("success"+Title);
//        var checkboxObj={};
//        checkboxObj.title=[];
//        //checkboxObj.fruitsDenied=[];
//
//        $("input:checkbox").each(function(){
//            var $this = $(this);
//
//            if($this.is(":checked")){
//                checkboxObj.title.push($this.attr("id"));
//            }else{
//                //checkboxObj.fruitsDenied.push($this.attr("id"));
//            }
//        });
//        
//        console.log(checkboxObj);
//
//    };

    $scope.getSearch = function(Title,searchtype){
      
        var data = { 
            Title: Title, 
            searchtype:searchtype,
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };

        $http.post('/product/search/searchfilter/',config).success(function(response, status, headers, config){
            //alert("category search");
            //console.log(response);
            $scope.shopProductscategorysearch = response;
        }).error(function(){
            console.log('Oops! Error listing products-list');
        });

    };
    
    /* filter data through checkbox */
    $scope.filtercheckboxsearch = function(Title,checkboxtype){
       
       
        var checkboxObj={};
        checkboxObj.title=[];
        //checkboxObj.cattitle=[];
       // checkboxObj.brandstitle=[];
         
            $("input:checkbox").each(function(){
                var $this = $(this);

                if($this.is(":checked")){
                    checkboxObj.title.push($this.attr("id"));
                }else{
                    //checkboxObj.fruitsDenied.push($this.attr("id"));
                }
            });
        
//        if(checkboxtype == 'categorycheckbox'){
//            $("input:checkbox").each(function(){
//                var $this = $(this);
//
//                if($this.is(":checked")){
//                    checkboxObj.cattitle.push($this.attr("id"));
//                }else{
//                    //checkboxObj.fruitsDenied.push($this.attr("id"));
//                }
//            });
//        }
//        if(checkboxtype == 'brandcheckbox'){
//            $("input:checkbox").each(function(){
//                var $this = $(this);
//
//                if($this.is(":checked")){
//                    checkboxObj.brandstitle.push($this.attr("id"));
//                }else{
//                    //checkboxObj.fruitsDenied.push($this.attr("id"));
//                }
//            });
//        }
        
        
        var data = { 
            checkboxObj: checkboxObj, 
            searchtype:checkboxtype,
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };


        $http.post('/product/search/searchfilter/',config).success(function(response, status, headers, config){
            //alert("category search");
            //console.log(response);
            $scope.limit= 2;
            $scope.shopProductscategorysearch = response;
        }).error(function(){
            console.log('Oops! Error listing products-list');
        });

    };
    
    $scope.setOrder = function (sorttype) {
        if(sorttype == 'price'){
            var order = $('#selectboxsortbyprice').val();
        }
        if(sorttype == 'name'){
            var order = $('#selectboxsortbyname').val();
        }
        
        var orderby = "";
        
        if(order == "desc" && sorttype == 'price'){
            orderby = "-product_price";
        }
        if(order == "asc" && sorttype == 'price'){
            orderby = "product_price";
        }
        if(order == "desc" && sorttype == 'name'){
            orderby = "-product_title";
        }
        if(order == "asc" && sorttype == 'name'){
            orderby = "product_title";
        }
        
        $scope.order = orderby;
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
    
    
    /*function to list categories in admin panel*/
    $scope.getCategoriesList = function(){
        $http.get('/admin/get-categories-list').success(function(categoryList){
            $scope.categoryList = categoryList;
        }).error(function(){
            console.log('Oops! Error listing get-users-list');
        });
    };
    
    /*function to list points in admin panel*/
    $scope.getPointsList = function(){
        $http.get('/admin/get-points-list').success(function(pointsList){
            console.log(pointsList);
            $scope.pointsList = pointsList;
        }).error(function(){
            console.log('Oops! Error listing get-points-list');
        });
    };
    
    $scope.delete_category = function(catId){
        alert("erwrwr");
         var data = { 
            catId: catId
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/admin/category/delete',config).success(function(response, status, headers, config){
             
          
        }).error(function(){
            console.log('Oops! Error delete-category');
        });
    };
    
    $scope.getEventsTypeList= function(){
       
        $http.get('/admin/get-eventtypes-list').success(function(eventtypelist){
          
           $scope.eventtypelist = eventtypelist;
           
        }).error(function(){
            console.log('Oops! Error listing event-types-list');
        });
    };
    
}]);

app.controller('eventController',['$scope', '$http', function ($scope, $http, $location, $routeParams) {
      
    $scope.getEventsList = function(){
        
        var config = {
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/product/get-events-list',config).success(function(response, status, headers, config){
            console.log(response);
            $scope.eventslist = response;
        }).error(function(){
            console.log('Oops! Error listing get-brands-list on search page');
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

app.directive('googleplace', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            var options = {
                types: [],
               // componentRestrictions: {country: 'in'}
               value:'chandigarh, India'
            };
            
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
            
            
            console.log(attrs.value);

              
            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                
                scope.$apply(function() {
                    model.$setViewValue(element.val());   
                   
                });
            });
        }
    };
});