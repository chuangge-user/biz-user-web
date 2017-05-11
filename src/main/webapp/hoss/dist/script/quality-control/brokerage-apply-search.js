define(function (require) {

    var $ = require('jquery');
    var navigation = require('navigation');
    var $modal = require('bootstrap/modal');

});

require(['bootstrap/tab'], function ($) {
    $(function () {
        var $approvaltableTab = $('#approvaltableTab');
        $approvaltableTab.find('a:first').tab('show');
    });
});