jQuery(function() {
    var remtime1 = parseInt("85999");
    var clock1,clock2;
    jQuery(document).ready(function() {
        clock1 = jQuery('.clock1').FlipClock({
            clockFace: 'DailyCounter',
            autoStart: false,
            callbacks: {
                stop: function() {
                    jQuery('.message').html('The clock has stopped!')
                }
            }
        });
        
        clock2 = jQuery('.clock2').FlipClock({
            clockFace: 'DailyCounter',
            autoStart: false,
            callbacks: {
                stop: function() {
                    jQuery('.message').html('The clock has stopped!')
                }
            }
        });

        clock1.setTime(remtime1);
        clock1.setCountdown(true);
        clock1.start();
        
        clock2.setTime(remtime1);
        clock2.setCountdown(true);
        clock2.start();

    });

    /* ----- Contact form ----- */
    $("#submit_btn").click(function(e) {
        setTimeout(function(){
            if(jQuery(".error").length == 0){
                $('#submit_btn').text('').append('<i class="fa fa-spinner fa-spin"></i>');
            }
        },20);
    });
    
    $(".btn-pricing").click(function(e) {
        $(".btn-pricing").attr('disabled','disabled');
        $(this).text('').append('Redirecting to PayPal <i class="fa fa-spinner fa-spin"></i>');
    });

    //social sharing on live now page
    $('.socialShare a').click(function(e) {
        e.preventDefault();
        var url = this.href,
            w = 500,
            h = 400,
            left = (screen.width / 2) - (w / 2),
            top = (screen.height / 2) - (h / 2);
            window.open(url, 'Social Share', 'toolbar=no, location=no, directories=no, status=no,' +
            ' menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    });
    
    $(document).on('click','.enable_disable_account',function(){
        angular.element(document.getElementById('enable_disable_account')).scope().enable_disable_account();
    });

    /*Form Validations start here :: SignIn Page*/
    jQuery("#login_form").validate({
        rules: {
            email: {
                required: true,
                email:true
            },
            password: {
                required: true
            },
            /*hiddenRecaptcha: {
                required: function() {
                    if(grecaptcha.getResponse() == '') {
                        return true;
                    } else {
                        return false;
                    }
                },
                remote: {
                    url: "https://www.google.com/recaptcha/api/siteverify",
                    type: "post",
                    data: {
                      response: function() {
                        return grecaptcha.getResponse()
                      },
                      secret: '6LcN0AYUAAAAAEXrlMCJWJ-a--A8-rVOY-E0xvme'
                    }
                }
            },*/
        },
        messages: {
            email: {
                required: "Please enter email address"
            },
            password: {
                required: "Please enter password"
            }
         }
    });
    
jQuery.validator.addMethod("nodot", function(value, element) {
	return this.optional(element) || /\./g.test(value);
}, "No dot please");

/* forget password page validation */

jQuery('#forgot_form').validate({
    rules:{
        email: {
            required: true,
            email:true,
            remote: {
                    url: "/checkemail",
                    type: "post",
                    data: {
                        action: function () {
                            return "checkemail";
                        },
                        username: function() {
                            var emailAddress = $('input[name=email]').val();
                            return emailAddress;
                        }
                    },
                    dataFilter: function(response) {
                        if (checkEmailSuccess(response) == 'false') return true;
                        else return false;

                    }
                }
            
        }
    },
    messages:{
        email:{
            remote: 'Email Id not exists'
        }
    }
});

/* Change password page validation */

jQuery('#change_password_form').validate({
    rules:{
        old_password: {
            required: true,
            remote: {
                url: "/check-old-password",
                type: "get",
                data: {
                    
                    old_password: function() {
                        var old_password = $("input[name=old_password]").val();
                        return old_password;
                    },
                    username: function(){
                        var username = $("input[name=username]").val();
                        return username;
                    }
                },
                dataFilter: function(response) {
                    if(response === 'match'){
                        return true;
                    }
                    else{
                        return false;
                    }
                }
            } 
        },
        new_password: {
            required: true,
            minlength: 6
        },
        confirm_password: {
            required: true,
            equalTo: '#new_password'
        }
    },
    messages: {
        confirm_password: {
            equalTo: 'Password and Confirm Password must be same!'
        },
        old_password: {
            remote: 'Incorrect Password'
        }
    }
});

/*Form Validations start here :: Signup Page*/
    jQuery("#signup_form").validate({
        rules: {
            firstName: {
                required: true
            },
            lastName: {
                required: true
            },
            dob: {
                required: true
            },
            username: {
                required: true,
                minlength: 5,
                maxlength: 20,
                letterswithbasicpunc:true,
                nowhitespace:true,
                //email:true,
                //nodot:true,
                remote: {
                    url: "/checkusername",
                    type: "post",
                    data: {
                        action: function () {
                            return "checkusername";
                        },
                        username: function() {
                            var username = $("input[name=username]").val();
                            return username;
                        }
                    },
                    dataFilter: function(response) {
                        return checkUsernameSuccess(response);
                    }
                }
            },
//            hiddenRecaptcha: {
//                required: function() {
//                    if(grecaptcha.getResponse() == '') {
//                        return true;
//                    } else {
//                        return false;
//                    }
//                },
//                remote: {
//                    url: "https://www.google.com/recaptcha/api/siteverify",
//                    type: "post",
//                    data: {
//                      response: function() {
//                        return grecaptcha.getResponse()
//                      },
//                      secret: '6LcN0AYUAAAAAEXrlMCJWJ-a--A8-rVOY-E0xvme'
//                    }
//                }
//            },
            gender: {
                required: true
            }, 
            city: {
                required: true
            },
            state: {
                required: true
            },
            country: {
                required: true
            },
            zipcode: {
                required: true
            },
            email: {
                required: true,
                email:true,
                remote: {
                    url: "/checkemail",
                    type: "post",
                    data: {
                        action: function () {
                            return "checkemail";
                        },
                        username: function() {
                            var emailAddress = $('input[name=email]').val();
                            return emailAddress;
                        }
                    },
                    dataFilter: function(response) {
                        return checkEmailSuccess(response);
                    }
                }
            },
            password: {
                required: true,
                minlength: 6
            },
            password1: {
                required: true,
                equalTo: "#password"
            },
            confirm_joining:{
                required: true,
            }
         },
         messages: {
            username: {
                remote: "Sorry, our system has detected that an account with this username already exists!"
            },
            email: {
                remote: "Sorry, our system has detected that an account with this email address already exists!"
            },
            password1: {
                equalTo: "Password and Confirm Password must be same!"
            }
//            ,
//            hiddenRecaptcha:{
//                required: "Please enter recaptcha",
//                remote: "Sorry, reCAPTCHA you entered is incorrect!"
//            }
         },
         submitHandler: function(form) {
            form.submit();
         }
    }); 
   
    /*Form Validations start here :: shipping form on checkout Page*/
    jQuery("#shipping_form").validate({
        rules: {
            ship_country: {
                required: true,
                
            },
            ship_firstname: {
                required: true,
                minlength: 3,
                maxlength: 20,
            },
            ship_lastname: {
                required: true,
                minlength: 3,
                maxlength: 20,
            },
            ship_addr1: {
                required: true,
                minlength: 5,
                maxlength: 20,
                letterswithbasicpunc:true,
               
                
            },

            ship_addr2: {
                minlength: 5,
                maxlength: 20,
                letterswithbasicpunc:true,
            }, 
            ship_state: {
                required: true,
                minlength: 5,
                maxlength: 20,
                letterswithbasicpunc:true,
            },
            ship_postcode: {
                required: true,
                minlength: 5,
                maxlength: 20,
                
            },
            phone_number: {
                required: true,
                minlength: 5,
                maxlength: 20,
            },
            ship_email: {
                required: true,
                email:true,
                
            },   
         },
        
         submitHandler: function(form) {
           
            if(localUserUsername){
            form.submit();
            }else{
                var scrollPos =  $("#logincheckoutsection").offset().top;
                $(window).scrollTop(scrollPos);
                $('.logincheckout').css('display','block');  
            }
         }
    }); 
   
   
   
   
   
   
   
    //code to make ajax request to check if username exists or not
    var checkUsernameSuccess = function(response){
        switch (response) {
            case 'noexists':
                return "true"; // <-- the quotes are important!
            case 'exists':
                return 'false';
                break;
            case undefined:
                return 'false';
                break;
            default:
                return 'false';
                break;
        }
        return false;
    };
    
    //code to make ajax request to check if email exists or not
    var checkEmailSuccess = function(response) {
        switch (response) {
            case 'noexists':
                return "true"; // <-- the quotes are important!
            case 'exists':
                return 'false';
                break;
            case undefined:
                return 'false';
                break;
            default:
                return 'false';
                break;
        }
        return false;
    };
});

/*code to show maps on footer of homepage*/
var map;
var markers = [];
var bounds;
var points = {};
function initialize(userData) {
    var mapOptions = {
        zoom: 3,
        center: new google.maps.LatLng(43.16103, -77.61092),
        scrollwheel: false
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
    setMarkers(userData);
}

//            google.maps.event.addDomListener(window, 'load', initialize);

function setMarkers(userData) {
    //console.log('userData: '+JSON.stringify(userData));
    var locations = [{  "lat":"57.015727",
                        "lon":"-106.498029",
                        "html":"<img src=\"http:\/\/placehold.it\/350x150\"  style=\"height: 35px;width: 35px;float:left; border: 1px solid;\" class=\"img-circle\"><a href=\"history.php?userId=29\"><h5 style=\"margin: 0;padding-left: 40px;\">Paul Joseph<\/h5><\/a><small style=\"margin: 0;padding-left: 5px;\">Canada<\/small>",
                        "name":"Paul Joseph"
                    },
                    {   "lat":"52.015727",
                        "lon":"-105.498029",
                        "html":"<img src=\"http:\/\/placehold.it\/350x150\"  style=\"height: 35px;width: 35px;float:left; border: 1px solid;\" class=\"img-circle\"><a href=\"history.php?userId=29\"><h5 style=\"margin: 0;padding-left: 40px;\">Mohit<\/h5><\/a><small style=\"margin: 0;padding-left: 5px;\">Canada<\/small>",
                        "name":"Mohit"
                    },
                    {   "lat":"59.015727",
                        "lon":"-108.498029",
                        "html":"<img src=\"http:\/\/placehold.it\/350x150\"  style=\"height: 35px;width: 35px;float:left; border: 1px solid;\" class=\"img-circle\"><a href=\"history.php?userId=29\"><h5 style=\"margin: 0;padding-left: 40px;\">Manjit<\/h5><\/a><small style=\"margin: 0;padding-left: 5px;\">Canada<\/small>",
                        "name":"Manjit"
                    }];
    var markersArray = [];
    var infowindow = new google.maps.InfoWindow({content: "temo"});
    var i = 0;
    var icon = new google.maps.MarkerImage("/images/map-pointer.png");
    $.each(locations, function (index, markerData) {
        var name = markerData.name;
        var lat = markerData.lat;
        var long = markerData.lon;
        var content = markerData.html;
        var myLatLng = new google.maps.LatLng(lat, long);
        points[i] = myLatLng;
        var marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            title: name,
            icon: icon
        });
        markersArray[i] = marker;
        google.maps.event.addListener(marker, 'click', function () {
            infowindow.setContent(content);
            infowindow.open(map, this);
        });
        i++;
    });
}

function initializeMap(userData) {
    
    initialize(userData);
}

// show notification popup
function show_notification(msg, type, reload_page){
    // defaults to false
    reload_page = reload_page || false;
   
    $("#notify_message").removeClass();
    $("#notify_message").addClass('alert-' + type);
    $("#notify_message").html(msg);
    $('#notify_message').slideDown(600).delay(1200).slideUp(600, function() {
        if(reload_page == true){
            location.reload();
        }
    });
}


// autocomplete search at header
//    $( "#search-box" ).autocomplete({
//    source: '/autocomplete-search',
//   
//    }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
//    ul.addClass('search-product-list');
//    return $( "<li>" )
//    .append( '<a href="javascript:;">'+item.product_title+' </a>' )
//    //.append( "<a>" + item.label + "<br>" + item.image + "</a>" )
//    .appendTo( ul );
//    };

