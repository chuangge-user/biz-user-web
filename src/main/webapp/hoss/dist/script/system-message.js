define(function (require) {
    /**
     * 提示信息，用于代替系统的 alert
     */
    var $ = require('jquery');

    var $body = $(document.body),
        $element = $('#systemMessage'),
        timer = null,
        messageType = {
            'error': '错误！',
            'alert': '警告！',
            'info': '信息！',
            'done': '完成！'
        },
        DEFAULTS = {
            autoHide: true,
            wait: 3000,
            type: 'alert',
            title: '警告！',
            detail: ''
        };

    if (!$element.length) {
        $element = $('<div id="systemMessage" class="system-message fade yahei"></div>');
        $body.append($element);
    } else {
        $element.html('');
    }

    var $close = $('<button class="close" type="button"><span>&times;</span><span class="sr-only">Close</span></button>');
    $element.append($close);

    var $title = $('<h4></h4>');
    $element.append($title);

    var $detail = $('<p></p>');
    $element.append($detail);

    $close.on('click', function (e) {
        $element.fadeOut();
    });

    function systemMessage(options) {
        var opt = {};

        if ($.type(options) === 'string') {
            options = {detail: options};
        }

        opt = $.extend({}, DEFAULTS, options);

        clear();

        $title.html(opt.title);
        $detail.html(opt.detail);
        $element.addClass('in system-message-' + opt.type).show();

        $element.css({
            marginLeft: -($element.width() / 2),
            marginTop: -($element.height() / 2)
        });

        if (opt.autoHide) {
            autoHide(opt.wait);
        }

    }

    function autoHide(wait) {
        autoHide.wait = wait;

        timer = setTimeout(function () {
            $element.fadeOut();
        }, wait);

        $element.on('mouseenter', function () {
            clearTimeout(timer);
        }).on('mouseleave', function () {
            autoHide(autoHide.wait);
        });
    }

    function clear() {
        clearTimeout(timer);

        $.each(messageType, function (name, valeu) {
            $element.removeClass('system-message-' + name);
        });

        $element.off().hide();
        $title.html('');
        $detail.html('');
    }



    return systemMessage
});