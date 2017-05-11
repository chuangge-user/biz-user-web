/**
 * Created by Administrator on 2014/8/20.
 */
define(function (require) {


    function myParseInt(value) {
        var result = 0;
        try {
            result = parseInt(value);
        } finally {
            if (!result) result = 0;
        }
        return result;
    }

    function myParseFloat(value) {
        var result = 0;
        try {
            result = parseFloat(value);
        } finally {
            if (!result) result = 0;
        }
        return result;
    }

    function parseToChinese(num) {
        if (!/^\d*(\.\d*)?$/.test(num) || parseInt(num) == 0) {
//            console.error("Number is wrong!");
            return "零圆整";
        }
        var AA = new Array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖");
        var BB = new Array("", "拾", "佰", "仟", "萬", "億", "圆", "");
        var CC = new Array("角", "分", "厘");
        var a = ("" + num).replace(/(^0*)/g, "").split("."), k = 0, re = "";
        for (var i = a[0].length - 1; i >= 0; i--) {
            switch (k) {
                case 0 :
                    re = BB[7] + re;
                    break;
                case 4 :
                    if (!new RegExp("0{4}\\d{" + (a[0].length - i - 1) + "}$").test(a[0]))
                        re = BB[4] + re;
                    break;
                case 8 :
                    re = BB[5] + re;
                    BB[7] = BB[5];
                    k = 0;
                    break;
            }
            if (k % 4 == 2 && a[0].charAt(i) == "0" && a[0].charAt(i + 2) != "0") re = AA[0] + re;
            if (a[0].charAt(i) != 0) re = AA[a[0].charAt(i)] + BB[k % 4] + re;
            k++;
        }
        if (a.length > 1) {
            re += BB[6];
            for (var i = 0; i < a[1].length; i++) {
                re += AA[a[1].charAt(i)] + CC[i];
                if (i == 2) break;
            }
            if (a[1].charAt(0) == "0" && a[1].charAt(1) == "0") {
                re += "元整";
            }
        } else {
            re += "元整";
        }
        return re;
    }

    function parseToPercentStr(val) {
        var floatVal = myParseFloat(val);
        var percentVal = floatVal * 100;
        return percentVal.toFixed(2) + "%";
    }

    return {
        myParseInt: myParseInt,
        myParseFloat: myParseFloat,
        parseToChinese: parseToChinese,
        parseToPercentStr: parseToPercentStr
    };

});