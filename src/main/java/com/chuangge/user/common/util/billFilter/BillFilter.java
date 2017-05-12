package com.chuangge.user.common.util.billFilter;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/*
 * Copyright (C), 2012-2014, 上海好屋网信息技术有限公司
 * Author:  俞志坚
 * Description:  
 * History: 变更记录
 * <author>           <time>             <version>        <desc>
 * 俞志坚             2015/1/16              1.0            创建文件
 *
 */public class BillFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        if(servletRequest instanceof BillCodeRequest){
            filterChain.doFilter(servletRequest, servletResponse);

        }else{
            filterChain.doFilter(new BillCodeRequest((HttpServletRequest)servletRequest),servletResponse);
        }

    }

    @Override
    public void destroy() {

    }
}
