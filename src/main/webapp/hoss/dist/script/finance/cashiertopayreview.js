require(['bootstrap/tab'], function ($) {
    $(function () {
        var $approvaltableTab = $('#approvaltableTab');
        $approvaltableTab.find('a:first').tab('show');

        $("a.toTab").click(function () {
            $("html, body").animate({
                scrollTop: $("#approvaltableTab").offset().top + "px"
            }, {
                duration: 500,
                easing: "swing"
            });
            return false;
        });
        $(".goback").click(function () {
            history.back();
        });

    });
});