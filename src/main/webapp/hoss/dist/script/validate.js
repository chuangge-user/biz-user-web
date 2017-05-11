define(function(require, exports, module) {
    var $ = require('jquery');
    var old = $.fn.isValid;
	$.fn.isValid = function(options) {
		valid.clearErrors();
		var form = $(this);
		var set  = {};
		var dataRules = $('[data-rules]', form);
		$.each(dataRules, function(index, item){
			var $item = $(item);
			var itemName = $item.attr('name');
			var ruleStr = $item.attr('data-rules');
			var ruleMessages =  $item.attr('data-messages');

            if (itemName == 'projectTypeList.groupBuyNum') {
//                console.info("222");
            }
			if(ruleStr) {
				var rulesObject =  rules.looseParse(ruleStr);
				if(!ruleMessages) {
					ruleMessagesObject = {};
				} else {
					ruleMessagesObject = rules.looseParse(ruleMessages);
				}
				var value = $item.val();
				for(var name in rulesObject){
					var baseValue = rulesObject[name];
					var mesg = ruleMessagesObject[name];
					var result = rules.valid(name, value, baseValue, mesg, $item);
					if(result){
//						if(set[itemName]) {
//						  continue;
//						}
						var error = {name:name, msg:result, item: $item};
						valid.addError({name:name, msg:result, item: $item}) ;
//						set[itemName] = error;
					}
				}
			}
		});
		
		if(valid.errors && valid.errors.length != 0) {
			valid.showErrors();
			return false;
		} 
		return true;

	};

var baseRule = {
  valid : function (value,baseValue,msg,control){
    if($.isArray(baseValue) && $.isString(baseValue[1])){
      if(baseValue[1]){
        msg = baseValue[1];
      }
      baseValue = baseValue[0];
    }
    var _self = this,
      validator = _self.validator,
      formatedMsg = this.formatError(_self,baseValue,msg),
      valid = true;
    value = value == null ? '' : value;
    return validator.call(_self,value,baseValue,formatedMsg,control);
  },
  parseParams: function (values){
    if(values == null){
      return {};
    }

    if($.isPlainObject(values)){
      return values;
    }

    var ars = values,
        rst = {};
    if($.isArray(values)){

      for(var i = 0; i < ars.length; i++){
        rst[i] = ars[i];
      }
      return rst;
    }

    return {'0' : values};
  },

  formatError : function (self,values,msg){
    var ars = this.parseParams(values); 
    msg = msg || self.msg;
    return msg || substitute(msg,ars);
  }
}

var Rule = function (config){
    $.extend(this, config);
	$.extend(this, baseRule);
	
}

var valid = {
	errors:new Array(),
	errorTpl : {
      view : true,
      value : '<span class="x-icon x-icon-small x-icon-error" data-title="{error}">!</span>'
    },
	errorContainer:new Array(),
	showError : {
      view : true
    },
	 /**
     * 是否仅显示一个错误
     * @type {Boolean}
     */
    showOneError: {

    },
	addError : function(obj) {
		var errorTpl = this.errorTpl;
		var  tipMsg = errorTpl.value.replace('{error}', obj.msg);
		obj.tipMsg = tipMsg;
		this.errors.push(obj); 
	},
	/**
     * 显示错误
     * @param {Array} 显示错误
     */
    showErrors : function(errors){
      var _self = this,
        errors = errors || _self.errors;
      $.each(errors, function(index, error){
			var domO = error.item;
			var tipMsg = error.tipMsg;
			var $tipMsgObj = $(tipMsg);
			$tipMsgObj.mouseover(function(){
					$tipMsgObj.attr('title', error.msg);
				$tipMsgObj.mouseout(function(){
					$tipMsgObj.attr('title', '');
				});
			});

			var $input = error.item;
			$input.addClass('hoss-form-field-error');

			_self.errorContainer.push({tipObj:$tipMsgObj, inputObj:$input});
		

			$(domO).parent().append($tipMsgObj);
	  });
    },
	 /**
     * 清除错误
     */
    clearErrors : function(deep){
      deep = deep == null ? true : deep;
      var _self = this;
	  _self.errors = new Array();
      if(deep){
        $.each(_self.errorContainer, function(i, item){
          item.tipObj.remove();
		   item.inputObj.removeClass('hoss-form-field-error');
        });
		_self.errorContainer = new Array();
      }
    }
};

var rules = {
	ruleMap: {},
    /**
     * 添加验证规则
     * @param rule 验证规则配置项或者验证规则对象
     * @param  {String} name 规则名称
     */
    add : function(rule){
      var name;
      if($.isPlainObject(rule)){
        name = rule.name;
        this.ruleMap[name] = new Rule(rule);        
      }else if(rule.get){
        name = rule.get('name'); 
        this.ruleMap[name] = rule;
      }
      return this.ruleMap[name];
    },
    /**
     * 删除验证规则
     * @param  {String} name 规则名称
     */
    remove : function(name){
      delete this.ruleMap[name];
    },
    /**
     * 获取验证规则
     * @param  {String} name 规则名称
     * @return 验证规则
     */
    get : function(name){
      return this.ruleMap[name];
    },
    /**
     * 验证指定的规则
     * @param  {String} name 规则类型
     * @param  {*} value 验证值
     * @param  {*} [baseValue] 用于验证的基础值
     * @param  {String} [msg] 显示错误的模板
     * @param  [control] 显示错误的模板
     * @return {String} 通过验证返回 null,否则返回错误信息
     */
    valid : function(name,value,baseValue,msg,control){
      var rule = this.get(name);
       if(control.attr('disabled')) {
           return null;
       }
      if(rule && baseValue){
        return rule.valid(value,baseValue,msg, control);
      }
      return null;
    },
    looseParse : function(data){
        try{
            return new Function('return ' + data + ';')();
        }catch(e){
            throw 'Json parse error!';
        }
    },
    substitute: function (str, o, regexp) {
        if (!$.isString(str)
            || (!$.isObject(o)) && !$.isArray(o)) {
            return str;
        }

        return str.replace(regexp || /\\?\{([^{}]+)\}/g, function (match, name) {
            if (match.charAt(0) === '\\') {
                return match.slice(1);
            }
            return (o[name] === undefined) ? '' : o[name];
        });
    },
    /**
     * 验证指定的规则
     * @param  {String} name 规则类型
     * @param  {*} values 验证值
     * @param  {*} [baseValue] 用于验证的基础值
     * @param   [control] 显示错误的模板
     * @return {Boolean} 是否通过验证
     */
    isValid : function(name,value,baseValue,control){
      return this.valid(name,value,baseValue,control) == null;
    },

	init : function() {
	    var required = rules.add({
			name : 'required',
			msg : '不能为空！',
			validator : function(value,required,formatedMsg){
			  if(required !== false && /^\s*$/.test(value)){
				return formatedMsg;
			  }
			}
		});

		 /**
		   * 相等验证
		   * <ol>
		   *  <li>name: equalTo</li>
		   *  <li>msg: 两次输入不一致！</li>
		   *  <li>equalTo: 一个字符串，id（#id_name) 或者 name</li>

		   */
		  var equalTo = rules.add({
			name : 'equalTo',
			msg : '两次输入不一致！',
			validator : function(value,equalTo,formatedMsg){
			  var el = $(equalTo);
			  if(el.length){
				equalTo = el.val();
			  } 
			  return value === equalTo ? undefined : formatedMsg;
			}
		  });


		  /**
		   * 不小于验证
		   * <ol>
		   *  <li>name: min</li>
		   *  <li>msg: 输入值不能小于{0}！</li>
		   *  <li>min: 数字，字符串</li>
		   * </ol>
		   *         {
		   *           min : 5
		   *         }
		   *         //字符串
		   */
		  var min = rules.add({
			name : 'min',
			msg : '输入值不能小于{0}！',
			validator : function(value,min,formatedMsg){
			  if(value !== '' && $.toNumber(value) < $.toNumber(min)){
				return formatedMsg;
			  }
			}
		  });

		  /**
		   * 不小于验证,用于数值比较
		   * <ol>
		   *  <li>name: max</li>
		   *  <li>msg: 输入值不能大于{0}！</li>
		   *  <li>max: 数字、字符串</li>
		   * </ol>
		   *         {
		   *           max : 100
		   *         }
		   *         //字符串
		   *         {
		   *           max : '100'
		   *         }
		   */
		  var max = rules.add({
			name : 'max',
			msg : '输入值不能大于{0}！',
			validator : function(value,max,formatedMsg){
			  if(value !== '' && parseFloat(value) > parseFloat(max)){
				return formatedMsg;
			  }
			}
		  });

		  /**
		   * 输入长度验证，必须是指定的长度
		   * <ol>
		   *  <li>name: length</li>
		   *  <li>msg: 输入值长度为{0}！</li>
		   *  <li>length: 数字</li>
		   * </ol>
		   */
		  var length = rules.add({
			name : 'length',
			msg : '输入值长度为{0}！',
			validator : function(value,len,formatedMsg){
			  if(value != null){
				value = $.trim(value.toString());
				if(len != value.length){
				  return formatedMsg;
				}
			  }
			}
		  });
		  /**
		   * 最短长度验证,会对值去除空格
		   * <ol>
		   *  <li>name: minlength</li>
		   *  <li>msg: 输入值长度不小于{0}！</li>
		   *  <li>minlength: 数字</li>
		   * </ol>
		   *         {
		   *           minlength : 5
		   *         }
		   */
		  var minlength = rules.add({
			name : 'minlength',
			msg : '输入值长度不小于{0}！',
			validator : function(value,min,formatedMsg){
			  if(value != null){
				value = $.trim(value.toString());
				var len = value.length;
				if(len < min){
				  return formatedMsg;
				}
			  }
			}
		  });

		  /**
		   * 最短长度验证,会对值去除空格
		   * <ol>
		   *  <li>name: maxlength</li>
		   *  <li>msg: 输入值长度不大于{0}！</li>
		   *  <li>maxlength: 数字</li>
		   * </ol>
		   *         {
		   *           maxlength : 10
		   *         }   
		   */
		  var maxlength = rules.add({
			name : 'maxlength',
			msg : '输入值长度不大于{0}！',
			validator : function(value,max,formatedMsg){
			  if(value){
				value = $.trim(value.toString());
				var len = value.length;
				if(len > max){
				  return formatedMsg;
				}
			  }
			}
		  });

		  /**
		   * 正则表达式验证,如果正则表达式为空，则不进行校验
		   * <ol>
		   *  <li>name: regexp</li>
		   *  <li>msg: 输入值不符合{0}！</li>
		   *  <li>regexp: 正则表达式</li>
		   * </ol> 
		   */
		  var regexp = rules.add({
			name : 'regexp',
			msg : '输入值不符合{0}！',
			validator : function(value,regexp,formatedMsg){
			  if(regexp){
				return regexp.test(value) ? undefined : formatedMsg;
			  }
			}
		  });

		  /**
		   * 邮箱验证,会对值去除空格，无数据不进行校验
		   * <ol>
		   *  <li>name: email</li>
		   *  <li>msg: 不是有效的邮箱地址！</li>
		   * </ol>
		   */
		  var email = rules.add({
			name : 'email',
			msg : '不是有效的邮箱地址！',
			validator : function(value,baseValue,formatedMsg){
			  value = $.trim(value);
			  if(value){
				return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(value) ? undefined : formatedMsg;
			  }
			}
		  });

		  /**
		   * 日期验证，会对值去除空格，无数据不进行校验，
		   * 如果传入的值不是字符串，而是数字，则认为是有效值
		   * <ol>
		   *  <li>name: date</li>
		   *  <li>msg: 不是有效的日期！</li>
		   * </ol>
		   */
		  var date = rules.add({
			name : 'date',
			msg : '不是有效的日期！',
			validator : function(value,baseValue,formatedMsg){
			  if($.isNumeric(value)){ //数字认为是日期
				return;
			  }
			  if($.isDate(value)){
				return;
			  }
			  value = $.trim(value);
			  if(value){
				return $.isDateString(value) ? undefined : formatedMsg;
			  }
			}
		  });

		  /**
		   * 不小于验证
		   * <ol>
		   *  <li>name: minDate</li>
		   *  <li>msg: 输入日期不能小于{0}！</li>
		   *  <li>minDate: 日期，字符串</li>
		   * </ol>
		   *         {
		   *           minDate : '2001-01-01';
		   *         }
		   *         //字符串
		   */
		  var minDate = rules.add({
			name : 'minDate',
			msg : '输入日期不能小于{0}！',
			validator : function(value,minDate,formatedMsg){
			  if(value){
				var date = $.toDate(value);
				if(date && date < $.toDate(minDate)){
				   return formatedMsg;
				}
			  }
			}
		  });

		  /**
		   * 不小于验证,用于数值比较
		   * <ol>
		   *  <li>name: maxDate</li>
		   *  <li>msg: 输入值不能大于{0}！</li>
		   *  <li>maxDate: 日期、字符串</li>
		   * </ol>
		   *         {
		   *           maxDate : '2001-01-01';
		   *         }
		   *         //或日期
		   *         {
		   *           maxDate : new Date('2001-01-01');
		   *         }
		   */
		  var maxDate = rules.add({
			name : 'maxDate',
			msg : '输入日期不能大于{0}！',
			validator : function(value,maxDate,formatedMsg){
			  if(value){
				var date =  $.toDate(value);
				if(date && date >  $.toDate(maxDate)){
				   return formatedMsg;
				}
			  }
			}
		  });
		  /**
		   * 数字验证，会对值去除空格，无数据不进行校验
		   * 允许千分符，例如： 12,000,000的格式
		   * <ol>
		   *  <li>name: number</li>
		   *  <li>msg: 不是有效的数字！</li>
		   * </ol>
		   */
		  var number = rules.add({
			name : 'number',
			msg : '不是有效的数字！',
			validator : function(value,baseValue,formatedMsg){
			  if($.isNumeric(value)){
				return;
			  }
			  value = value.replace(/\,/g,'');
			  return !isNaN(value) ? undefined : formatedMsg;
			}
		  });


        var integer = rules.add({
            name : 'integer',
            msg : '不是正整数！',
            validator : function(value,baseValue,formatedMsg){

                if(/^[0-9]*[1-9][0-9]*$/.test(value)){
                    return ;
                }
                value = value.replace(/\,/g,'');
                return formatedMsg;

//                //return /^[1-9]\d*|0$/.test(value) ? undefined : formatedMsg;
//                //value = value.replace(/\,/g,'');
//                return !/^[1-9]\d*|0$/.test(value) ? undefined : formatedMsg;
            }
        });

		//正数
		var float = rules.add({
			name : 'float',
			msg : '不是正数！',
			validator : function(value,baseValue,formatedMsg){
				if(parseFloat(value)>=0){
					return ;
				}
				return formatedMsg;
			}
		});

		  //测试范围
		  function testRange (baseValue,curVal,prevVal) {
			var allowEqual = baseValue && (baseValue.equals !== false);

			if(allowEqual){
			  return prevVal <= curVal;
			}

			return prevVal < curVal;
		  }
		  function isEmpty(value){
			return value == '' || value == null;
		  }
		  //测试是否后面的数据大于前面的
		  function rangeValid(value,baseValue,formatedMsg,group){
			var fields = group.getFields(),
			  valid = true;
			for(var i = 1; i < fields.length ; i ++){
			  var cur = fields[i],
				prev = fields[i-1],
				curVal,
				prevVal;
			  if(cur && prev){
				curVal = cur.get('value');
				prevVal = prev.get('value');
				if(!isEmpty(curVal) && !isEmpty(prevVal) && !testRange(baseValue,curVal,prevVal)){
				  valid = false;
				  break;
				}
			  }
			}
			if(!valid){
			  return formatedMsg;
			}
			return null;
		  }
		  /**
		   * 起始结束日期验证，前面的日期不能大于后面的日期
		   * <ol>
		   *  <li>name: dateRange</li>
		   *  <li>msg: 起始日期不能大于结束日期！</li>
		   *  <li>dateRange: 可以使true或者{equals : fasle}，标示是否允许相等</li>
		   * </ol>
		   *         {
		   *           dateRange : true
		   *         }
		   *         {
		   *           dateRange : {equals : false}
		   *         }
		   */
		  var dateRange = rules.add({
			name : 'dateRange',
			msg : '结束日期不能小于起始日期！',
			validator : rangeValid
		  });

		  /**
		   * 数字范围
		   * <ol>
		   *  <li>name: numberRange</li>
		   *  <li>msg: 起始数字不能大于结束数字！</li>
		   *  <li>numberRange: 可以使true或者{equals : fasle}，标示是否允许相等</li>
		   * </ol>
		   *         {
		   *           numberRange : true
		   *         }
		   *         {
		   *           numberRange : {equals : false}
		   *         }
		   */
		  var numberRange = rules.add({
			name : 'numberRange',
			msg : '结束数字不能小于开始数字！',
			validator : rangeValid
		  });

		  function getFieldName (self) {
			var firstField = self.getFieldAt(0);
			if(firstField){
			  return firstField.get('name');
			}
			return '';
		  }

		  function testCheckRange(value,range){
			if(!$.isArray(range)){
			  range = [range];
			}
			//不存在值
			if(!value || !range.length){
			  return false;
			}
			var len = !value ? 0 : !$.isArray(value) ? 1 : value.length;
			//如果只有一个限定值
			if(range.length == 1){
			  var number = range [0];
			  if(!number){//range = [0],则不必选
				return true;
			  }
			  if(number > len){
				return false;
			  }
			}else{
			  var min = range [0],
				max = range[1];
			  if(min > len || max < len){
				return false;
			  }
			}
			return true;
		  }

		  /**
		   * 勾选的范围
		   * <ol>
		   *  <li>name: checkRange</li>
		   *  <li>msg: 必须选中{0}项！</li>
		   *  <li>checkRange: 勾选的项范围</li>
		   * </ol>
		   *         //至少勾选一项
		   *         {
		   *           checkRange : 1
		   *         }
		   *         //只能勾选两项
		   *         {
		   *           checkRange : [2,2]
		   *         }
		   *         //可以勾选2-4项
		   *         {
		   *           checkRange : [2,4
		   *           ]
		   *         }
		   */
		  var checkRange = rules.add({
			name : 'checkRange',
			msg : '必须选中{0}项！',
			validator : function(record,baseValue,formatedMsg,group){
			  var name = getFieldName(group),
				value,
				range = baseValue;
				
			  if(name && range){
				value = record[name];
				if(!testCheckRange(value,range)){
				  return formatedMsg;
				}
			  }
			  return null;
			}
		  });
	}
  };
  //初始化验证规则
  rules.init();

  $.fn.isValid.noConflict = function(){
      $.fn.datepicker = old;
      return this;
  };
  module.exports = $;
});
