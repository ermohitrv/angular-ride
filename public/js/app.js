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
        $scope.deleteEvents();
        $http.get('/draw-events-map/'+eventmonth).success(function(eventsList){
            console.log(eventsList);
            $scope.eventsList = eventsList;
            var widthScreen = $(document).width();
            //if (widthScreen > 768) {

                if (window.google && google.maps) {
                    // Map script is already loaded
                    initializeMap(eventsList,"eventsmap");
                } else {
                    initializeMap(eventsList,"eventsmap");
                }
            //}
        }).error(function(){
            console.log('Oops! Error listing get-events-list');
        });
    };
    $scope.deleteEvents = function(){
        $http.get('/delete-previousevents').success(function(response){
            console.log(response);
        }).error(function(){
            console.log('Oops! Error listing get-brands-list on search page');
        });
    };
    $scope.drawContactLocation = function(eventmonth){
        var widthScreen = $(document).width();
        if (widthScreen > 768) {
            if (window.google && google.maps) {
                // Map script is already loaded
                initializeContactMap();
            } else {
                initializeContactMap();
            }
        }
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

          if( $("#search-box").length > 0 ){
            $( "#search-box" ).autocomplete({
                source: '/autocomplete-search',
            }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
                   var productlink = "/product/"+item.product_link;
                   ul.addClass('search-product-list');
                   return $( "<li>" )
                  .append( '<a href='+productlink+'><span>'+item.product_title+'</span></a>' )
                   .appendTo( ul );
            };
          }
        });
        $scope.latestEvents = function(){
            $http.get('/latestevents').success(function (response){
                $scope.footerlatestevents = response;
               }).error(function(err){
               console.log('Oops! Error occur'+err);
            });
        };
        $scope.getNotifications = function(){
            $http.get('/getnotification').success(function (response){
                console.log(response.notificationresults);
                $scope.notificationresults = response.notificationresults;
               }).error(function(err){
               console.log('Oops! Error occur'+err);
            });
        };
        $scope.removeNotification = function(notificationId){
          var data = {
              notificationId: notificationId,
          };
          var config = {
              params: data,
              headers : {'Accept' : 'application/json'}
          };
          $http.post('/removenotification',config).success(function (response, status, headers, config){
              if(response.status == "success"){
                  $scope.getNotifications();
              }
          }).error(function(err){
             console.log('Oops! Error occur'+err);
          });
        };
        $scope.showtime = function(notificationdate){
           var date = new Date();
           var newdate = date.toISOString();
            var d1 = new Date(notificationdate);
            var d2 = new Date(newdate);
            var timediff = 0;
            var time = 0;
            var diff = d2 - d1;

            if (diff > 60e3){
                console.log(Math.floor(diff / 60e3), 'minutes ago' );
                timediff =  Math.floor(diff / 60e3);
                time = Math.round(timediff)+" minutes ago";
                if(timediff > 60){
                     timediff = timediff/60;
                     time = Math.round(timediff)+" hour ago";
                }
            }else {
                console.log(Math.floor(diff / 1e3), 'seconds ago' );
                timediff =  Math.floor(diff / 1e3);
                time =  Math.round(timediff)+" seconds ago";
            }
            $scope.stopwatch = time;
        }
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
app.controller('productController',['$scope', '$http','$sce',function ($scope, $http, $sce) {

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
            var text = $sce.trustAsHtml(view);
            $scope.relatedProductsView = text;
        }).error(function(){
            console.log('Oops! Error listing related-products-list');
        });
    };

    /* function to add item to the cart */
    $scope.addToCart = function(productId,quantity_box,size_box,color_box){
        console.log(productId,quantity_box);
        var data = {
            product_id: productId,
            product_quantity: quantity_box,
            product_color: color_box,
            product_size: size_box,
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
        //alert(imageSrc);
        var data = {
            image_src: imageSrc,
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/product/imageresize',config).success(function (response, status, headers, config){
           //alert("success"+response.success);
            $('.zoom').magnify({
                speed: 200,
                src: "http://localhost:2286/public/uploads/fb-pc.jpg?resize=100,100",

            });
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

    $scope.renderCountry = function(country){
        $scope.selectedOption = country;
    };

    $scope.calculateTax = function(country,state){

        $scope.taxprice = "0.00";
        $('#taxhiddenprice').val("0.00");
        var data = {
            country: country,
            state: state
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        if(localUserUsername){
            $http.post('/get-tax',config).success(function (response, status, headers, config){
                if(response != ""){
                response = parseFloat(Math.round(response * 100) / 100).toFixed(2);
                $scope.taxprice = response;
                $('#taxhiddenprice').val(response);

                }else{
                    response = parseFloat(Math.round(response * 100) / 100).toFixed(2);
                    $scope.taxprice = "0.00";
                    $('#taxhiddenprice').val(response);

                }


            }).error(function(err){
               console.log('Oops! Error occur'+err);
            });
        }

    };

    $scope.calculateShipping = function(country,state,weight){

        $scope.shippingprice = "0.00";
        $('#shippinghiddenprice').val("0.00");
        var data = {
            country: country,
            state: state,
            weight:weight
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        if(localUserUsername){
            $http.post('/get-shipping',config).success(function (response, status, headers, config){
                if(response != ""){
                response = parseFloat(Math.round(response * 100) / 100).toFixed(2);
                $scope.shippingprice = response;
                $('#shippinghiddenprice').val(response);

                }else{
                    response = parseFloat(Math.round(response * 100) / 100).toFixed(2);
                    $scope.shippingprice = "0.00";
                    $('#shippinghiddenprice').val("0.00");

                }
                $scope.calculateTotalPrice($scope.shippingprice);


            }).error(function(err){
               console.log('Oops! Error occur'+err);
            });
        }

    };

    $scope.calculateTotalPrice = function(shippingcost){
        var taxcost = $('#taxcost').text();
        //var shippingcost = $('#shippingcost').text();
        var subtotal = $('#subtotalcheckout').text();

        //var  ordertotal = parseFloat(Math.round(subtotal * 100) / 100).toFixed(2) + +parseFloat(Math.round(taxcost * 100) / 100).toFixed(2) + +parseFloat(Math.round(shippingcost * 100) / 100).toFixed(2);
        var  ordertotal = parseFloat(subtotal) + +parseFloat(taxcost) + +parseFloat(shippingcost);
        ordertotal = parseFloat(Math.round(ordertotal * 100) / 100).toFixed(2);
        $('#ordertotal').text(ordertotal);
        $('#shiptotalamount').val(ordertotal);
        $('#ordertotalhiddenprice').val(subtotal);
    }

     $scope.calculateCartAmount = function(productId,quantity,totalprice){


        var data = {
            productId: productId,
            quantity: quantity,
            totalprice:totalprice
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };

        $http.post('/product/calculate-cartamount',config).success(function (response, status, headers, config){


        }).error(function(err){
               console.log('Oops! Error occur'+err);
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

    $scope.searchResults = function (searchKey,searchType) {

        var data = {
            searchKey: searchKey,
            searchType:searchType,
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };

        $http.post('/search-results',config).success(function(response, status, headers, config){

            if(searchType == "top"){
                $scope.topproductresults = response[0].productResults;
                $scope.topeventresults = response[1].eventResults;
                $scope.toppeopleresults = response[2].peopleResults;
            }
            if(searchType == "events"){
                $scope.eventResults = response;
            }
            if(searchType == "people"){
                $scope.peopleResults = response;
            }

        }).error(function(){
            console.log('Oops! Error listing products-list');
        });
    }

     $scope.searchEvents = function(fromEventDate,toEventDate){

        var data = {
            fromEventDate: fromEventDate,
            toEventDate: toEventDate,
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/search-events',config).success(function (response, status, headers, config){

             $scope.eventResults = response;


        }).error(function(err){
           console.log('Oops! Error occur'+err);
        });
    };

     $scope.searchPeople = function(city,state,country){

        var data = {
            city: city,
            state: state,
            country: country
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/search-people',config).success(function (response, status, headers, config){

             $scope.peopleResults = response;


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

    $scope.getreviewsList= function(){

        $http.get('/admin/get-reviews-list').success(function(reviewslist){

           $scope.reviewslist = reviewslist;

        }).error(function(){
            console.log('Oops! Error listing review-list');
        });
    };

    $scope.getcontactList= function(){

        $http.get('/admin/get-contacts-list').success(function(contactlist){

           $scope.contactlist = contactlist;

        }).error(function(){
            console.log('Oops! Error listing contactlist');
        });
    };

    $scope.getorderList= function(){

        $http.get('/admin/get-order-list').success(function(orderlist){

           $scope.orderlist = orderlist;

        }).error(function(){
            console.log('Oops! Error listing orderlist');
        });
    };

    $scope.getTaxList= function(){

        $http.get('/admin/get-tax-list').success(function(taxlist){

           $scope.taxlist = taxlist;

        }).error(function(){
            console.log('Oops! Error listing event-types-list');
        });
    };

    $scope.renderCountry = function(country){
        $scope.selectedOption = country;
    };

    $scope.getShippingList= function(){

        $http.get('/admin/get-shipping-list').success(function(shippinglist){

           $scope.shippinglist = shippinglist;

        }).error(function(){
            console.log('Oops! Error listing shipping-list');
        });
    };

    $scope.getsuggestionList= function(){

        $http.get('/admin/get-suggestions-list').success(function(suggestionList){

           $scope.suggestionList = suggestionList;

        }).error(function(){
            console.log('Oops! Error listing suggestion list');
        });
    };

    $scope.getOrderDetail = function(id){
        var data = {
            order_id: id
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/admin/view-order-detail',config).success(function (response, status, headers, config){

            var text = $sce.trustAsHtml(response);
            $scope.orderDetailView = response;


        }).error(function(err){
           console.log('Oops! Error occur'+err);
        });
    };

    $scope.deleteProductImage = function(imageId,imageName,productId){
        var data = {
            imageName: imageName,
            productId:productId
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/admin/delete-productimage',config).success(function (response, status, headers, config){
           if(response == "success"){
               $( "#"+imageId).remove();
           }

        }).error(function(err){
           console.log('Oops! Error occur'+err);
        });
    };

}]);

app.controller('eventController',['$scope', '$http', function ($scope, $http, $location, $routeParams) {

    $scope.getEventsList = function(){

        $scope.deleteEvents();

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

    $scope.getEventsInvitationList = function(){

        var config = {
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/get-eventsinvitation-list',config).success(function(response, status, headers, config){
            if(response.status == "success"){
                $scope.eventsinvitationlist = response.eventsInvitation;
            }

        }).error(function(){
            console.log('Oops! Error listing get-brands-list on search page');
        });
    };

    $scope.countJoining = function(eventId){

        var data = {
            eventId: eventId,
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/get-count-eventjoined',config).success(function(response, status, headers, config){
            if(response.status == "success"){

                $scope.count = response.count;
                $('#joineventcount_'+eventId).text(response.count);
            }

        }).error(function(){
            console.log('Oops! Error listing get-brands-list on search page');
        });

    };

    $scope.deleteEvents = function(){


        $http.get('/delete-previousevents').success(function(response){

            console.log(response);

        }).error(function(){
            console.log('Oops! Error listing get-brands-list on search page');
        });
    };



}]);


app.controller('friendsController',['$scope', '$http', function ($scope, $http, $location, $routeParams) {
     /* function to send friend request */
    $scope.sendRequest = function(profileuseremail){

       var data = {
            profileuseremail: profileuseremail,
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/sendrequest',config).success(function (response, status, headers, config){

            console.log(response);
            if(response.status == "success"){
                //$('#addfriend').css('display','none');
                //$('#requestsent').css('display','block');
                $scope.friendStatus(profileuseremail);
            }

        }).error(function(err){
           console.log('Oops! Error occur'+err);
        });
    };

    $scope.friendStatus = function(profileuseremail){

       var data = {
            profileuseremail: profileuseremail,
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/friendstatus',config).success(function (response, status, headers, config){
            console.log(response);
            $scope.friendstatus = response;


        }).error(function(err){
           console.log('Oops! Error occur'+err);
        });
    };

    $scope.getFriendrequestsList = function(){

        var config = {
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/get-friendrequests-list',config).success(function(response, status, headers, config){
            console.log(response);
            $scope.friendrequestslist = response;
        }).error(function(){
            console.log('Oops! Error listing get-friends-list on friends page');
        });
    };

    $scope.unFriendprofile = function(profileuseremail,anotheruseremail){
        var data = {
            sentBy: profileuseremail,
            sentTo : anotheruseremail,
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/unfriend',config).success(function (response, status, headers, config){

            console.log(response);
            if(response.status == "success"){

                $scope.friendStatus(profileuseremail);
            }

        }).error(function(err){
           console.log('Oops! Error occur'+err);
        });
    };

    $scope.getFriendsList = function(){

        var config = {
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/get-friends-list',config).success(function(response, status, headers, config){
            console.log(response);
            $scope.friendslist = response;
        }).error(function(){
            console.log('Oops! Error listing get-friends-list on friends page');
        });
    };

    $scope.unFriendfromlist = function(sentBy,sentTo){

       var data = {
            sentBy: sentBy,
            sentTo : sentTo,
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/unfriend',config).success(function (response, status, headers, config){

            console.log(response);
            if(response.status == "success"){

                $scope.getFriendsList();
            }

        }).error(function(err){
           console.log('Oops! Error occur'+err);
        });
    };

    $scope.changeFriendButtonText = function(mouseText){

        if(mouseText == "enter"){
           $('#friendtext').text("Unfriend");
        }

        if(mouseText == "leave"){
            $('#friendtext').text("Friends");
        }
    };

    $scope.followUser = function(followingUseremail){

        var data = {
            followingUseremail: followingUseremail,
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/follow-user',config).success(function (response, status, headers, config){

            console.log(response);
            if(response.status == "success"){
                $scope.followStatus(followingUseremail);

            }


        }).error(function(err){
           console.log('Oops! Error occur'+err);
        });
    }

    $scope.followStatus = function(profileuseremail){

       var data = {
            profileuseremail: profileuseremail,
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/followstatus',config).success(function (response, status, headers, config){

            $scope.followstatus = response.count;


        }).error(function(err){
           console.log('Oops! Error occur'+err);
        });
    };

    $scope.changeFollowButtonText = function(mouseText){

        if(mouseText == "enter"){
           $('#followtext').text("UnFollow");
        }

        if(mouseText == "leave"){
            $('#followtext').text("Following");

        }
    };

    $scope.unFollow = function(profileuseremail,loggeduseremail){
        var data = {
            followTo: profileuseremail,
            followBy : loggeduseremail,
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/unfollow',config).success(function (response, status, headers, config){

            console.log(response);
            if(response.status == "success"){

                $scope.followStatus(profileuseremail);
            }

        }).error(function(err){
           console.log('Oops! Error occur'+err);
        });
    };

    $scope.requestactionfromProfile = function(pendingapproval,profileuseremail){
       var data = {
            profileuseremail: profileuseremail,
            pendingapproval: pendingapproval
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
        $http.post('/requestactionfromProfile',config).success(function (response, status, headers, config){

            console.log(response);
            if(response.status == "success"){

                $scope.friendStatus(profileuseremail);
            }

        }).error(function(err){
           console.log('Oops! Error occur'+err);
        });
    };

    $scope.listEventsInvite = function(userprofileemail){
        var data = {
            userprofileemail: userprofileemail,
        };
        var config = {
            params: data,
            headers : {'Accept' : 'application/json'}
        };
    $http.post('/list-events-invite',config).success(function (response, status, headers, config){
            $scope.eventsinviteList = response;
        }).error(function(err){
           console.log('Oops! Error occur'+err);
        });
    };

    $scope.inviteFriend = function(userprofileemail){
        var selectedeventArray = [];
        $("input:checkbox[name=selectevent]:checked").each(function(){

            selectedeventArray.push($(this).val());
        });
        var data = {
            userprofileemail  : userprofileemail,
            selectedeventArray: selectedeventArray
        };
        var config = {
            params: data,
            headers: { 'Accept': 'application/json' }
        };
        $http.post('/invite-friend',config).success(function (response, status, headers, config){
            if(response == "success"){
                $('.selecteventcheckbox').attr('checked', false);
                $('.selectalleventcheckbox').attr('checked', false);
            }
        }).error(function(err){
             console.log('Oops! Error occur'+err);
        });
    };

    $scope.countFriendsFollowers = function(userprofileemail,counttype){
        var data = {
            counttype         : counttype,
            userprofileemail  : userprofileemail
        };
        var config = {
            params: data,
            headers: { 'Accept': 'application/json' }
        };
        $http.post('/count-friends',config).success(function (response, status, headers, config){
            if(response.status == "success" && counttype == "friends"){
                if(response.countfriends == 1){
                    $scope.totalFriends = response.countfriends+" Friend";
                }else if(response.countfriends > 1){
                    $scope.totalFriends = response.countfriends+" Friends";
                }else{
                    $scope.totalFriends = "You have "+response.countfriends+" Friends";
                }
            }
            if(response.status == "success" && counttype == "followers"){
                $scope.totalFollowers = response.countfollowers;
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


app.directive('googleplacesearch', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            var options = {
                types: [],

            };

            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

            var geocoder =  new google.maps.Geocoder();



            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {

                var place = element.val();
                scope.$apply(function() {
                    model.$setViewValue(element.val());

                });

            geocoder.geocode( { 'address': place}, function(results, status) {
                  if (status == google.maps.GeocoderStatus.OK) {
                    var city = "";
                    var state = "";
                    var country = "";

                    if(results[0].address_components[0].long_name){
                        city = results[0].address_components[0].long_name;
                    }
                    if(results[0].address_components[2].long_name){
                        state = results[0].address_components[2].long_name;
                    }
                    if(results[0].address_components[3].long_name){
                        country = results[0].address_components[2].long_name;
                    }

                    var $scope = angular.element(document.getElementById("searchresult_page")).scope(); // get scope of shop controller
                    $scope.searchPeople(city,state,country);

            }});


            });
        }
    };
});
