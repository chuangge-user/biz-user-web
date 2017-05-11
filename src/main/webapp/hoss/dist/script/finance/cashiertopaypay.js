define(function (require) {

    var $ = require('jquery');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');

    $(function () {
        var $btntopay = $('.btntopay'),$btntoreview = $('.btntoreview');
        $btntopay.on(
            {click:function(){
                window.location.href="cashiertopay-pay.html";
            }
            });
        $btntoreview.on(
            {click:function(){
                window.location.href="cashiertopay-review.html";
            }
            });
    });
});