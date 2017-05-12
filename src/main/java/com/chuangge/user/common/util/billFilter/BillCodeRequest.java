package com.chuangge.user.common.util.billFilter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.util.Map;

/*
 * Copyright (C), 2012-2014, 上海好屋网信息技术有限公司
 * Author:  俞志坚
 * Description:  
 * History: 变更记录
 * <author>           <time>             <version>        <desc>
 * 俞志坚             2015/1/16              1.0            创建文件
 *
 */
public class BillCodeRequest extends HttpServletRequestWrapper {

    private Map<String,String[]> _paramMaps;

    public BillCodeRequest(HttpServletRequest request) {
        super(request);
        this._paramMaps=request.getParameterMap();
    }


    public String [] getNParamValues(String paramName){
        return _paramMaps.get(paramName);
    }

    public String getNParamValue(String paramName){
      if(_paramMaps.containsKey(paramName)){
          return _paramMaps.get(paramName)[0];
        }else {
          return "";
      }

    }
}
