package com.chuangge.user.login.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.druid.support.json.JSONUtils;
import com.chuangge.common.utils.JsonUtils;
import com.chuangge.redis.util.RedisUtils;
import com.chuangge.user.common.util.Jsonp;
import com.chuangge.user.login.vo.LoginRequestVo;

@Controller
public class LoginController {
	
	
	/*****
	 * 账户、密码登录
	 * @param username 用户名
	 * @param password 密码
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "outside/user/login")
	@ResponseBody
	public Jsonp login(String reqStr) throws Exception {
		LoginRequestVo vo = (LoginRequestVo) JSONUtils.parse (reqStr);
		Jsonp jsonP = new Jsonp();
		Map returnMap = new HashMap();
		returnMap.put("returnCode", 1);
		returnMap.put("returnMessage", "success");

		return jsonP;
	}
	
	/****
	 * 获取验证码
	 * @param reqStr
	 * @return
	 * @throws Exception
	 */
	@RequestMapping(value = "outside/user/getVerifyCode")
	@ResponseBody
	public Jsonp getVerifyCode(String mobile) throws Exception {
		Jsonp jsonP = new Jsonp();
		Map returnMap = new HashMap();
		returnMap.put("returnCode", 1);
		returnMap.put("returnMessage", "success");
		int a = (int)(Math.random()*(9999-1000+1))+1000;
		RedisUtils.opsForValue().set("getVerifyCode"+mobile,a+"",10,TimeUnit.MINUTES);
		RedisUtils.opsForValue().set("getVerifyCode19222222",a+"",10,TimeUnit.MINUTES);
		System.out.println(RedisUtils.opsForValue().get("getVerifyCode"+mobile));
		return jsonP;
	}
	
	
}
