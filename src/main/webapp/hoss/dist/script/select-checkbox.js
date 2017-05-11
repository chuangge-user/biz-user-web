define(function (require) {

    var $ = require('jquery');



    /**
     * checkbox 的全选、全不选、反选
     */
    var methods = {
        toggle: function ($that, $targetCheckbox) {
            $targetCheckbox.prop(
                'checked',
                $that.prop('checked')
            );

            $targetCheckbox.on('change', function (e) {
                var isSelectAll = true;

                $.each($targetCheckbox, function (i, element) {
                    if (!$(element).prop('checked')) {
                        isSelectAll = false;
                    }
                });

                $that.prop('checked', isSelectAll);
            });
        },
        inverse: function ($that, $targetCheckbox) {
            var $elem;
            if ($that.prop('checked')) {
                $.each($targetCheckbox, function () {
                    $elem = $(this);

                    if ($elem.prop('checked')) {
                        $elem.prop('checked', false);
                    } else {
                        $elem.prop('checked', true);
                    }
                });

                $that.prop('checked', false);
            }
        }
    };

    var old = $.fn.selectCheckbox;

    $.fn.selectCheckbox = function (options) {

        var settings = {
            'type': 'toggle',
            'selector': ''
        };

        return this.each(function () {
            if (options) {
                $.extend(settings, options);
            }

            var $that = $(this),
                $targetCheckbox = $(settings.selector);

            $that.on('change', function (e) {
                if (methods[settings.type]) {
                    methods[settings.type]($that, $targetCheckbox);
                }
            });
        });

    };


    $.fn.selectCheckbox.noConflict = function () {
        $.fn.selectCheckbox = old;
        return this;
    };



    return $;
});