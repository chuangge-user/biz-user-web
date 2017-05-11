/**
 * Created by 001425 on 2014/12/15.
 */

define(function () {
//检查元素是否为空
    function check_submit(formid, rules, rules_notice) {
        for (var i = 0; i < rules.length; i++) {
            var element = rules[i];
            var _element = $('#'+ formid + ' input').filter('[name="' + element + '"]');
            if (!$.trim(_element.val())) {
                return i;
            }
        }

        return true;
    }

    return check_submit;
});