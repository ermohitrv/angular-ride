jQuery(document).ready(function(){
//    jQuery(document).on('keyup','input#search-box',function(){
//        $(this).val( $(this).val().replace(/[^ -~]/g, '') );
//    });
//    jQuery(document).on('keyup','input#email',function(){
//        $(this).val( $(this).val().replace(/[^ -~]/g, '') );
//    });
//    jQuery(document).on('keyup','#signup_form input,#login_form input',function(){
//        $(this).val( $(this).val().replace(/[^ -~]/g, '') );
//    });
    
});
jQuery(function() {
   
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
//    //signup page
//    jQuery( "#date_of_birth" ).datepicker({
//      changeMonth: true,
//      changeYear: true,
//      yearRange: "-100:+0",
//      dateFormat: 'yy-mm-dd'
//    });
//    
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
