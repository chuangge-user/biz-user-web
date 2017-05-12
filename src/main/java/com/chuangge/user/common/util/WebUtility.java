/**
 * 宝龙电商
 * org.powerlong.sso.common.utility
 * WebUtility.java
 *
 * 2013-7-2-上午11:00
 * 2013宝龙公司-版权所有
 *
 */
package com.chuangge.user.common.util;

import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;


/**
 * WebUtility
 *
 * @author Zhanggj
 * @version 1.0.0
 * @email zhanggj-hws@powerlong.com
 * @date 2013-7-2-上午11:02
 * @description Web层辅助工具类
 */
public class WebUtility {

    private static Logger logger = Logger.getLogger(WebUtility.class);
    public static final String TOKEN_KEY="key";

    /**
     * 获取浏览器IP地址
     *
     * @param request
     * @return
     */
    public static String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }


    /**
     * 获取Cookie 信息
     *
     * @param
     * @return
     */
    public static Map getCookies(HttpServletRequest request) {
        Map values = new HashMap();
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                try {
                    values.put(cookie.getName(), java.net.URLDecoder.decode(cookie.getValue(), "UTF-8"));
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        }
        return values;
    }

    /**
     * 设置Cookie 信息
     *
     * @param
     * @return
     */
    public static void setCookies(HttpServletResponse response, Map<String, Object> input) {
        if (response != null) {
            for (String key : input.keySet()) {
                if (!key.equalsIgnoreCase("timeout") && !key.equalsIgnoreCase("domain")) {
                    try {
                        String value = input.get(key).toString();
                        String timeout = null == input.get("timeout") ? "0" : input.get("timeout").toString();
                        String domain = null == input.get("domain") ? "" : input.get("domain").toString();
                        value = URLEncoder.encode(StringUtils.isBlank(value) ? "" : value, "utf-8");
                        Cookie cookie = new Cookie(key, value);
                        if (StringUtils.isNotBlank(timeout)) {
                            cookie.setMaxAge(Integer.valueOf(timeout));
                        }
                        if (StringUtils.isNotBlank(domain)) {
                            cookie.setDomain(domain);
                        }
                        cookie.setPath("/");
                        response.addCookie(cookie);
                    } catch (Exception ex) {
                        logger.error("写入Cookie异常,key=" + key + ",完整参数:" + input, ex);
                    }
                }
            }
        }
    }

    /**
     * 获取当前 服务器 SERVER URL
     *
     * @param request
     * @return
     */
    public static String getLocalhostURL(HttpServletRequest request) {
        StringBuffer url = new StringBuffer(request.getScheme());
        url.append("://").append(request.getServerName());
        if (request.getServerPort() != 80) {
            url.append(":").append(request.getServerPort());
        }
        return url.toString();
    }

    /**
     * 生成 请求 SSO  请求地址
     *
     * @param request
     * @param serverURL
     * @return
     */
    public static String generatorRequestSsoURL(HttpServletRequest request, String serverURL) throws Exception {
        // 生成 Callback 地址
        StringBuffer redirectURL = request.getRequestURL();
        String queryString = request.getQueryString();
        if (StringUtils.isNotBlank(request.getQueryString())) {
            queryString = queryString.replaceAll("&?cas_logout=[^=&]+", "");
            if (queryString.startsWith("&")) {
                queryString = queryString.substring(1, queryString.length());
            }
            if (StringUtils.isNotBlank(queryString)) {
                redirectURL.append("?").append(queryString);
            }
        }
        // 生成 SSO 服务器 地址
        StringBuffer fullServerURL = new StringBuffer();
        fullServerURL.append(serverURL);
        fullServerURL.append("?");
        fullServerURL.append(Constants.CAS_REDIRECT_URL_KEY);
        fullServerURL.append("=");
        fullServerURL.append(URLEncoder.encode(redirectURL.toString(), "UTF-8"));
        return fullServerURL.toString();
    }

    /**
     * 把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
     *
     * @param request
     * @return
     */
    public static String buildSign(Map request) {
        List<String> fields = new ArrayList<String>(request.keySet());
        Collections.sort(fields);
        StringBuffer fieldsString = new StringBuffer();
        for (int i = 0; i < fields.size(); i++) {
            // 把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
            fieldsString.append(fields.get(i)).append("=").append(request.get(fields.get(i))).append("&");
        }
        return fieldsString.toString();
    }

    /**
     * 加入session attr
     *
     * @param requesto
     * @return
     */
    public static void createSeesion(HttpServletRequest request,String hossSessionId) {
    	Map<String, String> cookies =  getCookies(request);
    	if (StringUtils.isBlank((String)WebUtil.getRequest().getSession().getAttribute("key")))
    	{
    		//令牌校验时还未写入
    		if(org.apache.commons.lang.StringUtils.isNotBlank(hossSessionId)){
    			WebUtil.getRequest().getSession().setAttribute(TOKEN_KEY, hossSessionId);
    		} else {
    			WebUtil.getRequest().getSession().setAttribute(TOKEN_KEY, cookies.get(Constants.HOSS_SESSION_LOGIN_ID));
    		}
    		
    		  
    	}
    }
    
    public static void main(String[] args) {

    }
}
