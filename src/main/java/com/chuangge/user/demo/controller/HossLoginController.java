package com.chuangge.user.demo.controller;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.net.URLDecoder;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.regex.Pattern;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.chuangge.authcenter.model.dto.UserInfoDTO;
import com.chuangge.authcenter.model.result.ResultDO;
import com.chuangge.authcenter.service.AuthUserService;
import com.chuangge.redis.util.RedisUtils;
import com.chuangge.user.common.BrowserCacheUtils;
import com.chuangge.user.common.util.CasManagerUtils;
import com.chuangge.user.common.util.Constants;
import com.chuangge.user.common.util.Jsonp;
import com.chuangge.user.common.util.WebUtility;
import com.ly.fn.inf.util.StringUtil;

/**
 * 登陆.
 */
@Controller
public class HossLoginController {
	private static Logger logger = LoggerFactory.getLogger(HossLoginController.class);

	public static String SESSION_KEYCODE = "SESSION_KEYCODE";

	// 官网app菜单表识
	public final static String AUTH_MENU_LIST = "customer_mng";

	private Pattern excludeUrlPattern = null;

	@Autowired
	private AuthUserService authUserService;

	Font mFont = new Font("Times New Roman", Font.BOLD, 17);

	private static Color getRandColor(int fc, int bc) {
		Random random = new Random();
		int r = fc + random.nextInt(bc - fc);
		int g = fc + random.nextInt(bc - fc);
		int b = fc + random.nextInt(bc - fc);
		return new Color(r, g, b);
	}

	/**
	 * 登录页面获取验证码
	 *
	 * @param request
	 * @param response
	 * @throws javax.servlet.ServletException
	 * @throws java.io.IOException
	 */
	@RequestMapping(value = "getVerCode")
	public void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setHeader("Pragma", "No-cache");
		response.setHeader("Cache-Control", "no-cache");
		response.setDateHeader("Expires", 0);
		response.setContentType("image/jpeg");
		int width = 85, height = 20;
		BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);

		Graphics g = image.getGraphics();
		Random random = new Random();
		g.setColor(getRandColor(200, 250));
		g.fillRect(1, 1, width - 1, height - 1);
		g.setColor(new Color(102, 102, 102));
		g.drawRect(0, 0, width - 1, height - 1);
		g.setFont(this.mFont);

		g.setColor(getRandColor(160, 200));
		for (int i = 0; i < 155; i++) {
			int x = random.nextInt(width - 1);
			int y = random.nextInt(height - 1);
			int xl = random.nextInt(6) + 1;
			int yl = random.nextInt(12) + 1;
			g.drawLine(x, y, x + xl, y + yl);
		}
		for (int i = 0; i < 70; i++) {
			int x = random.nextInt(width - 1);
			int y = random.nextInt(height - 1);
			int xl = random.nextInt(12) + 1;
			int yl = random.nextInt(6) + 1;
			g.drawLine(x, y, x - xl, y - yl);
		}

		String sRand = "";
		for (int i = 0; i < 5; i++) {
			int itmp = random.nextInt(26) + 97;
			int itmp2 = random.nextInt(10) + 48;
			char ctmp;
			if (random.nextInt(2) == 0) {
				ctmp = (char) itmp;
			} else {
				ctmp = (char) itmp2;
			}

			sRand += String.valueOf(ctmp);
			g.setColor(new Color(20 + random.nextInt(110), 20 + random.nextInt(110), 20 + random.nextInt(110)));
			g.drawString(String.valueOf(ctmp), 15 * i + 10, 14);
		}
		request.getSession().setAttribute(SESSION_KEYCODE, sRand);
		g.dispose();
		ImageIO.write(image, "JPEG", response.getOutputStream());
	}

	/**
	 * 验证登陆
	 *
	 * @return
	 */
	@RequestMapping(value = "Login")
	public String Login(String username, String password, String code, Long empId, String _sign, String callback,
			HttpServletRequest request, HttpServletResponse response) throws Exception {

		logger.info("request sso login,ip is :" + request.getRequestURL());
		BrowserCacheUtils.noCache(response);

		return "/app/account/login";
	}

	/**
	 * 验证登陆
	 *
	 * @return
	 */
	@RequestMapping(value = "loginSubmit")
	@ResponseBody
	public Jsonp LoginSubmit(String username, String password, String code, Long empId, String _sign, String callback,
			HttpServletRequest request, HttpServletResponse response) {
		ResultDO<UserInfoDTO> result = null;

		try {
			// 获取验证码次数的cookie
			String captchaTime = "captchaTime";
			Cookie captchaTimeCookie = null;

			Cookie[] cookies = request.getCookies();
			for (Cookie cookie : cookies) {
				if (captchaTime.equals(cookie.getName())) {
					captchaTimeCookie = cookie;
					break;
				}
			}

			if (StringUtil.isBlank(username) || StringUtil.isBlank(password)) {
				return Jsonp.paramError("用户名或密码为空");
			}

			if ((code != null && !"".equals(code))
					|| (captchaTimeCookie != null && Integer.parseInt(captchaTimeCookie.getValue()) >= 3)) {
				String s = request.getSession().getAttribute(SESSION_KEYCODE) == null ? ""
						: request.getSession().getAttribute(SESSION_KEYCODE).toString();
				if (!code.equalsIgnoreCase(s)) {
					return Jsonp.paramError("验证码错误");
				}
			} else {
				if (captchaTimeCookie == null) {
					captchaTimeCookie = new Cookie(captchaTime, "1");
				} else {
					captchaTimeCookie.setValue((Integer.parseInt(captchaTimeCookie.getValue()) + 1) + "");
				}
				captchaTimeCookie.setPath("/");
				captchaTimeCookie.setMaxAge(1800);
				response.addCookie(captchaTimeCookie);
			}
			try {
				result = authUserService.userLogin(username, md5(password));
			} catch (Exception e) {
				e.printStackTrace();
			}

			// 清空验证码
			request.getSession().setAttribute(SESSION_KEYCODE, "");

			if (!result.isSuccess()) {
				return Jsonp.paramError(result.getErrMsg());
			}
			//redis 操作 要做session 共享，已经去掉，逻辑复杂
			RedisUtils.opsForValue().set("session", request.getSession().getId());
			System.out.println(RedisUtils.opsForValue().get("session"));
			
			final UserInfoDTO userInfoDTO = result.getModule();

			final String sessionId = request.getSession().getId();
			logger.info("request.getSession().getId(),{}", sessionId);

			// 清空 验证码cookie
			if (captchaTimeCookie != null) {
				captchaTimeCookie.setValue(null);
				captchaTimeCookie.setMaxAge(0);
				captchaTimeCookie.setPath("/");
				response.addCookie(captchaTimeCookie);
			}
			// 登陆成功写入凭证
			try {
				loginSuccess(userInfoDTO, response, request);
			} catch (UnsupportedEncodingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			return Jsonp.success(userInfoDTO);
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * 用户登出
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "Logout")
	@ResponseBody
	public Jsonp logout(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> map = new HashMap<String, Object>(1);
			String sessionId = request.getSession().getId();
			return Jsonp.success(map);
		} catch (Exception e) {
			logger.error(e.getMessage());
			return Jsonp.error("退出失败");
		}
	}

	/**
	 * 登录成功
	 *
	 * @return
	 */
	@RequestMapping("success")
	public String success(HttpServletRequest request, ModelMap model) {
		Map cookie = WebUtility.getCookies(request);
		// 检测用户是否已经登录
		if (cookie.containsKey(Constants.CAS_TGC_KEY)
				&& CasManagerUtils.tgcValidation(cookie.get(Constants.CAS_TGC_KEY).toString())) {
			// model.put("user",
			// casManager.getUserByTgc(cookie.get(Constants.CAS_TGC_KEY).toString()));
			String redirect = "http://localhost:8080/biz-user-web/index.htm" + "?" + Constants.CAS_TICKET_KEY + "="
					+ request.getParameter(Constants.CAS_TICKET_KEY);
			return "redirect:" + redirect;
		} else {
			return "redirect:login.htm";
		}
		// return "success";
	}

    @RequestMapping("index")
    public String index() {
        return "/index";
    }

	/**
	 * 登陆成功写入用户凭证
	 * 
	 * @param userInfoDTO
	 * @param response
	 * @param request
	 * @throws UnsupportedEncodingException
	 */
	public void loginSuccess(UserInfoDTO userInfoDTO, HttpServletResponse response, HttpServletRequest request)
			throws UnsupportedEncodingException {
		// 登录成功 生成 会话 TGC ,存入 CACHE ，并且写入 客户端 COOKIE
		final String TGC = CasManagerUtils.tgcGrant(userInfoDTO.getId(), userInfoDTO.getUserName());
		final String userIdJoinTgc = CasManagerUtils.getUserByTgc(TGC);
		WebUtility.setCookies(response, new HashMap() {
			{
				put(Constants.CAS_TGC_KEY, userIdJoinTgc.split(":")[2]);
				put(Constants.CAS_UID_KEY, userIdJoinTgc.split(":")[1]);
				put("uname", userIdJoinTgc.split(":")[0]);
				put("timeout", -1);
				put("domain", "");
			}
		});
		// 登录成功 生成票据
		String ticket = CasManagerUtils.ticketGrant(TGC);
		// 重定向URL 回 APP端
		request.setAttribute("success", true);
		String redirect = "http://localhost:8080/biz-user-web/index.htm";
		redirect = URLDecoder.decode(URLDecoder.decode(redirect, "UTF-8"), "UTF-8");
		request.setAttribute("redirect", redirect);
		// 获取跳转的首页地址
		userInfoDTO.setHomePageUrl(redirect);
	}

	/**
	 * md5加密
	 * 
	 * @param plainText
	 * @return
	 */
	public static String md5(String plainText) {
		byte[] secretBytes = null;
		try {
			secretBytes = MessageDigest.getInstance("md5").digest(plainText.getBytes());
		} catch (NoSuchAlgorithmException e) {
			throw new RuntimeException("没有md5这个算法！");
		}
		String md5code = new BigInteger(1, secretBytes).toString(16);// 16进制数字
		// 如果生成数字未满32位，需要前面补0
		for (int i = 0; i < 32 - md5code.length(); i++) {
			md5code = "0" + md5code;
		}
		return md5code;
	}
}
