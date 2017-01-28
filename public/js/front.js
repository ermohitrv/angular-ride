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
    console.log(userData);
    var locations = [{  "lat":"37.958729",
                        "lon":"58.384617",
                        "html":"<img src=\"http:\/\/placehold.it\/350x150\"  style=\"height: 35px;width: 35px;float:left; border: 1px solid;\" class=\"img-circle\"><a href=\"history.php?userId=29\"><h5 style=\"margin: 0;padding-left: 40px;\">Boda Martin<\/h5><\/a><small style=\"margin: 0;padding-left: 5px;\">Ashgabat, Turkmenistan<\/small>",
                        "name":"Boda Martin"
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
    }
    );
}

$(function () {
    //var scope = angular.element(document.getElementById('homeController')).scope();
    //scope.drawUsersMap();
    
    //scope.$apply(function () {
    //    var ss = scope.drawUsersMap();
    //    console.log(JSON.stringify(scope.usersList));
    //});
    var widthScreen = $(document).width();
    if (widthScreen > 768) {
        if (window.google && google.maps) {
            console.log(JSON.stringify(scope.usersList));
            // Map script is already loaded
            initializeMap();
        } else {
            lazyLoadGoogleMap();
        }
    }
});

function lazyLoadGoogleMap() {
    console.log('a');
    $.getScript("https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&callback=initializeMap")
        .done(function (script, textStatus) {
            //alert("Google map script loaded successfully");
        })
        .fail(function (jqxhr, settings, ex) {
            //alert("Could not load Google Map script: " + jqxhr);
        });
}

function initializeMap(userData) {
    initialize(userData);
}