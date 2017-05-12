package com.chuangge.user.login.vo;

import com.chuangge.user.common.util.Jsonq;

public class LoginRequestVo extends Jsonq {
	private String username ;
	private String password;
	private String phone;
	private String verifyCode; //手机验证码
	
	private int type; //登录类型  0账户登录   1手机验证码登录  
	
	
	public int getType() {
		return type;
	}
	public void setType(int type) {
		this.type = type;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public String getVerifyCode() {
		return verifyCode;
	}
	public void setVerifyCode(String verifyCode) {
		this.verifyCode = verifyCode;
	}
	
	
	
	
}
