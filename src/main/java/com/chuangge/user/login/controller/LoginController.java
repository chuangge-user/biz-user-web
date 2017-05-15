package com.chuangge.user.login.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.alibaba.druid.support.json.JSONUtils;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.chuangge.redis.util.RedisUtils;
import com.chuangge.user.common.util.Jsonp;
import com.chuangge.user.login.vo.LoginRequestVo;
import com.chuangge.user.service.SmsSendService;
import com.chuangge.user.util.AppConfigConstants;

@Controller
public class LoginController {
	
	@Autowired
	private SmsSendService smsSendService;
	
	
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
//		LoginRequestVo vo = (LoginRequestVo) JSONUtils.parse (reqStr);
		Jsonp jsonP = new Jsonp();
//		Map returnMap = new HashMap();
//		returnMap.put("returnCode", 1);
//		returnMap.put("returnMessage", "success");

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
		int a = (int)(Math.random()*(9999-1000+1))+1000;
		RedisUtils.opsForValue().set("getVerifyCode"+mobile,a+"",5,TimeUnit.MINUTES);
		System.out.println(RedisUtils.opsForValue().get("getVerifyCode"+mobile));
		
		JSONObject param = new JSONObject();
		param.put("code", a+"");
		System.out.println(smsSendService.sendSms("15201590885", param.toJSONString()));
		return jsonP;
	}
	
	
}
