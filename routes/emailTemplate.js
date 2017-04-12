

/* email template */
this.emailMessage = function (body){
      
        var email = '<div style="width:620px;margin:0 auto;border:12px solid #f0f1f2;color:#696969;font:14px Arial,Helvetica,sans-serif">';
	email += '<div style="width:600px;margin:0 auto;border:12px solid #f0f1f2;color:#696969;font:14px Arial,Helvetica,sans-serif"><table align="center" width="600" height="auto" style="position:relative" cellpadding="0" cellspacing="0"><tbody><tr><td><center><img src="http://rideprix.com/img/paris.jpg" border="0" width="100%" height="200" class="CToWUd a6T" tabindex="0"><img src="http://rideprix.com:2286/images/logo.png" style="width: 35%;position: absolute;top: 150px;left: 10px;"><div class="a6S" dir="ltr" style="opacity: 0.01; left: 641px; top: 270px;"></div></center> </td> </tr> </tbody></table>';
	email += '<div class="content-container" style="padding:18px;">'+body+'</div>';

	email += '<table width="100%" align="center" bgcolor="#ccc"><tbody><tr><td align="center"><br>';
                
        email += '<a href="javascript:;" target="_blank" style="text-decoration:none;"><img src="http://cdn.younow.com/images/news3_links_fb.jpg" border="0" hspace="3" width="34" height="32" class="CToWUd" style="border-radius: 20px;"></a><a href="javascript:;" target="_blank" style="text-decoration:none;"><img src="http://cdn.younow.com/images/news3_links_tw.jpg" border="0" hspace="3" width="34" height="32" class="CToWUd" style="border-radius: 20px;"></a>';
            	
        email += '<a href="javascript:;" target="_blank" style="text-decoration:none;"><img src="http://cdn.younow.com/images/news3_links_yt.jpg" border="0" hspace="3" width="34" height="32" class="CToWUd"  style="border-radius: 20px;"></a>';
                        
        email += '<a href="javascript:;" target="_blank" style="text-decoration:none;"><img src="http://cdn.younow.com/images/news3_links_tm.jpg" border="0" hspace="3" width="34" height="32" class="CToWUd" style="border-radius: 20px;"></a><a href="javascript:;" target="_blank" style="text-decoration:none;"><img src="http://cdn.younow.com/images/news3_links_mobile.jpg" border="0" hspace="3" width="34" height="32" class="CToWUd" style="border-radius: 20px;"></a>';
        
        email += '<br><br>';
        
        email += '<font face="arial" size="1" color="#999999">Ride Pric. Inc<br><a href="javascript:;" style="text-decoration:none" target="_blank">Privacy</a> | <a href="javascript:;" style="text-decoration:none">Unsubscribe</a></font>';
             
        email += '</td></tr></tbody></table></div>';
    
        return email;
}
