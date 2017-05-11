define(function (require) {
    var hoss = require('hoss'),
    sessionStorage = hoss.sessionStorage;
    function domReady() {
        var $auth = JSON.parse(sessionStorage.getItem('sessionData'));
        function authcheck(){
            if(!($auth.id && $auth.id==-1)){//超级管理员不做权限校验
                var $pageauthList =  $('[auth-type-value]');
                $pageauthList.each(function () {
                    var value = $(this).attr('auth-type-value');
                    if(!func(value)){
                        //$(this).css("display:none");
                        $(this).remove();
                    }
                });
            }
        }
        function func(value){
           var authStr = $auth.authStr;//所有操作权限集合
           if(authStr.indexOf(value)>=0){
               return true;
           }else{
               return false;
           }
        }

        setInterval(function() {
            authcheck();
        }, 100);

    }

    $(document).ready(domReady);

});