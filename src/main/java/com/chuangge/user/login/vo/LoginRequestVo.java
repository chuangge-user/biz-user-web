package com.chuangge.user.login.vo;

import com.chuangge.user.common.util.Jsonq;

public class LoginRequestVo extends Jsonq {
	private String username ;
	private String password;
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
	
}
