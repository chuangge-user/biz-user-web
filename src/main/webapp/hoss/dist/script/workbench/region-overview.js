define(function (require) {

    var $ = require('jquery');
    var navigation = require('navigation');
    var dropdown = require('bootstrap/dropdown');

    $(function(){
        $('.dropdown-toggle').dropdown();
    });

});