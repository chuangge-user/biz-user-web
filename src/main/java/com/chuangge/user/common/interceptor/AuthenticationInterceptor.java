package com.chuangge.user.common.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

/** 
 * @Project 	: 
 * @Program Name: 
 * @ClassName	: AuthenticationInterceptor 
 * @Author 		:  
 * @CreateDate  : 2014-10-9 下午1:39:37  
 */
public class AuthenticationInterceptor extends HandlerInterceptorAdapter  {
	Logger log = LoggerFactory.getLogger(getClass());
	
	@Override
	public boolean preHandle(HttpServletRequest request,
			HttpServletResponse response, Object handler) throws Exception {
		System.out.println("进入拦截器！！");
		return true;
	}
}
