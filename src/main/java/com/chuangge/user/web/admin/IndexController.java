/**
 * 好屋中国
 * com.hoss.sso.web.admin
 * IndexController.java
 *
 * 2015-6-15-下午5:50
 * 2015宝龙公司-版权所有
 *
 */
package com.chuangge.sso.web.admin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * IndexController
 *
 * @author guonan
 * @version 1.0.0
 * @date 2015-6-15下午5:50
 * @email guonan@haowu.com
 * @description 职责描述
 */
@Controller
public class IndexController {
    @RequestMapping("index")
    public String index() {
        return "/index";
    }
}
