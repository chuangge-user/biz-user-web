package com.chuangge.user.common.util;

import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.codehaus.jackson.annotate.JsonValue;
import org.codehaus.jackson.map.util.JSONPObject;
import org.springframework.data.domain.PageImpl;
import org.springframework.web.multipart.MultipartHttpServletRequest;

/***
 * json响应对象
 * @author lizhiwei
 *
 */
public class Jsonp {

    private String callback=null;
    private java.util.Map jsonp;
    public static final String callbackKey="callback";
    private static final String statusCode = "statusCode";
    private static final String dataKey = "data";
    private static final String statusDetail ="statusDetail";
    
    private boolean isMultipart=false;


    public Jsonp(){
        jsonp=new HashMap();
    }


    private Jsonp(String status, Object data, String detail){
        jsonp=new HashMap();
        setStatus(status);
        setDetail(detail);
        setData(data);
    }


    public String getStatus() {
        return (String)jsonp.get(statusCode);
    }

    public Jsonp setStatus(String status) {
        if(null==status)
            jsonp.put("statusCode","");
        else
            jsonp.put("statusCode",status);
        return this;
    }

    public Object getData() {
        return jsonp.get(dataKey);
    }

    public String getCallback() {
        return callback;
    }

    @JsonValue
    public Object jsonpValue(){
        if( callback==null ){
            setDefaultCallback();
        }
        JSONPObject result = new JSONPObject(callback,jsonp);

        if( isMultipart ){

            String script=JsonUtil.toJson(result);
            return new JsonString("<script>try{ "+script+" }catch(e){  top.postMessage('"+script+"'); }</script>");
        }else{
            return result;
        }
    }

    private void setDefaultCallback(){
        try{
            setCallback(WebUtil.getRequest());
        }catch (Exception e){
            setCallback("");
        }
    }

    public Jsonp setCallback(String callback) {
        if( callback==null )
            callback="";
        this.callback = callback;
        return this;
    }


    public Jsonp setCallback(HttpServletRequest request){

        isMultipart = (request instanceof MultipartHttpServletRequest);
        setCallback(request.getParameter(callbackKey));
        return this;
    }


    /**
     * 设置 响应数据
     *      列表类型数据(list)会自动转换为分页类型的数据
     * @param data
     * @return
     */
    public Jsonp setData(Object data) {
        if(data instanceof List){
            jsonp.put(dataKey,new PageImpl((List)data));
        }else{
            jsonp.put(dataKey,data);
        }
        return this;
    }

    public String getDetail() {
        return (String)jsonp.get("statusDetail");
    }

    public Jsonp setDetail(String message) {
        if(null==message)
            jsonp.put("statusDetail","");
        else
            jsonp.put("statusDetail",message);
        return this;
    }

    public Jsonp Multipart(boolean isMultipart) {
        this.isMultipart = isMultipart;
        return this;
    }


    public static Jsonp success(){
        return newInstance(ConstantsUtil.CommonCode.SUCCESS_CODE,"",ConstantsUtil.CommonMessage.SUCCESS_MESSAGE);
    }
    public static Jsonp success(Object data){
        return newInstance(ConstantsUtil.CommonCode.SUCCESS_CODE,data,ConstantsUtil.CommonMessage.SUCCESS_MESSAGE);
    }

    public static Jsonp error(){
        return newInstance(ConstantsUtil.CommonCode.ERROR_CODE,"",ConstantsUtil.CommonMessage.ERROR_MESSAGE);
    }

    public static Jsonp error(String msg){
        return newInstance(ConstantsUtil.CommonCode.ERROR_CODE,"",msg);
    }

    public boolean isMultipart() {
        return isMultipart;
    }

    public void setMultipart(boolean isMultipart) {
        this.isMultipart = isMultipart;
    }

    public static Jsonp paramError(){
        return newInstance(ConstantsUtil.CommonCode.PARAM_ERROR_CODE,"",ConstantsUtil.CommonMessage.PARAM_ERROR_MESSAGE);
    }

    public static Jsonp paramError(String msg){
        return newInstance(ConstantsUtil.CommonCode.PARAM_ERROR_CODE,"",msg);
    }


    public static Jsonp newInstance(String status,Object data,String detail){
        return new Jsonp(status,data,detail);
    }
}
