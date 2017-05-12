package com.chuangge.user.login.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class LoginController {
	/**
	 * 验证登陆
	 * @return
	 */
	@RequestMapping(value = "outside/user/login")
	@ResponseBody
	public Map login(String username, String password, HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map returnMap = new HashMap();
		returnMap.put("returnCode", 1);
		returnMap.put("returnMessage", "success");

		return returnMap;
	}
	
	
	
	
	
}
