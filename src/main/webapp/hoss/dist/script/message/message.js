define(function (require) {

    var $ = require('jquery');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');

    $(function () {
        var $approvalListTab = $('#approvalListTab');
        $approvalListTab.find('a:first').tab('show');
        $("a.toTab").click(function () {
            $("html, body").animate({
                scrollTop: $approvalListTab.offset().top + "px"
            }, {
                duration: 500,
                easing: "swing"
            });
            return false;
        });
//        $(".goback").click(function () {
//            history.back();
//            return false;
//        });
    });

});