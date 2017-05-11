
function checkNumInt(objname,num){

    var name = "#"+objname;
    if(isNaN(num)||0>parseInt(num)){
        $(name).val(0)
    }else{
        $(name).val(parseInt(num))
    }
}
function checkNumFloat(objname,num){

    var name = "#"+objname;
    if(isNaN(num)||0>parseFloat(num).toFixed(2)){
        $(name).val("0")
    }else{
        $(name).val(parseFloat(num).toFixed(2))
    }
}
function checkFormat(num){
    if(!/^(\+|-)?\d+(\.\d+)?$/.test(num)){
        return num;
    }
    var re = new RegExp().compile("(\\d)(\\d{3})(,|\\.|$)");
    num += "";
    while(re.test(num))
        num = num.replace(re, "$1,$2$3")
    return num;
}
function checkComma(num){
    return num.replace(/,/g,"");
}