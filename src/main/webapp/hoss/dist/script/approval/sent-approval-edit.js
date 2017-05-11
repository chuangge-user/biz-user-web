define(function (require) {

    var $ = require('jquery');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');

    $(function () {
        var $approvalListTab = $('#approvalListTab'),
            $pickapproval=$('#pick-approval'),
            $approvalitem=$('.approval-item'),
            $approvalcol=$('.approval-col');
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
        $approvalitem.click(function () {
            $approvalcol.removeClass('hide');
        });
        $pickapproval.click(function () {
            $approvalcol.addClass('hide');
        });
        $(".goback").click(function () {
            history.back();
        });
    });

});
