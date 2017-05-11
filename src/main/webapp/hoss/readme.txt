目录结构：
    app/
        ├── kbd/                   客倍多
        ├── account/               账号
        │   ├── login.html
        │   ├── logout.html
        │   └── reset-password.html
        ├── ad/                    广告管理
        ├── admin/                 系统管理员
        ├── approval/              审批管理
        ├── broker/                经纪人
        ├── case-field/            案场
        ├── expand/                拓展
        ├── finance/               财务
        ├── my-approval/           我的审批
        ├── workbench/             我的工作台
        ├── operations/            运营
        ├── project/               项目管理
        ├── quality-control/       品控
        ├── to-do/                 待办事项
        ├── no-script/             提醒升级启用脚本
        ├── upgrade-browser/       提醒升级浏览器版本
    demo/
    dist/
        ├── font/                  字体
        ├── image/                 图片文件
        │   └── kbd/
        ├── script/                业务模块，脚本文件
        │   ├── kbd/
        │   └── account/
        ├── style/                 样式文件，包含 bootstrap 的基础样式
        │   ├── kbd/
        │   ├── account/
        │   ├── my-workbench/
        │   ├── bootstrap.css
        │   └── common.css
        ├── widget/                微件、组件
        │   ├── autocomplete/
        │   ├── datepicker/
        │   ├── pagination/
        │   ├── placeholder/
        │   └── ztree/
    docs/
    lib/
        ├── bootstrap/
        ├── echarts/
        ├── jquery/
        ├── esl/
        ├── template/
    test/
    src/
        ├── lib/        基础模块，存放基础类库模块
        │   ├── esl/                    模块化，遵循 AMD 规范
        │   ├── jquery/                 DOM选择器，AJAX等……
        │   ├── bootstrap/              bootstrap 插件
        │   ├── template/               HTML模板
        │   └── echarts/                图表
        │       └── zrender/                图表的基础库
        ├── dist/       存放静态文件，包含业务模块
        │   ├── style/                 样式文件，包含 bootstrap 的基础样式
        │   ├── image/                 图片文件
        │   ├── script/                业务模块，脚本文件
        │   ├── widget/                微件、组件
        │   └── font/                  字体
        ├── app/        存放 html
        │   ├── directory-name/
        │   │   ├──file-name.html
        │   │   ├──file-name.html
        │   │   └──file-name.html
        │   └── file-name.html
        ├── index.html
        ├── Gruntfile.js    用于配置或者定义Grunt任务和加载Grunt插件
        ├── package.json    npm模块发布的项目元数据
        ├── .csslintrc      css 语法规则配置文件
        └── .jshintrc       js 语法规则配置文件



约定：
    文件编码：utf-8。
    所有 js 以模块化方式加载，遵循 AMD 规范。

    lib/ 下的基础模块，非必要，轻易不要做修改。
    dist/script/ 将业务模块放到这个目录下。

    文件名以中划线分隔，如：file-name.html。
    页面中用到的 id 名，以小骆峰式命名。如：idName。
    保证 id 的唯一性，并仅做为 js 的钩子。不能用于 css 的选择器。
    页面中用到的 class 名，以中划线分隔。如：class-name。
    class 名可做为 js 的钩子，与 css 的选择器。

    样式文件、脚本文件的文件的顶部注释格式：
        /*!
         * 注释内容
         */
     其它格式的注释在文件压缩时会被删除。

    代码风格：
        svn://svn.haowu.com/doc/03 PHP及前端/01 新人开发快速指南/前端开发规范.doc

    浏览器支持：
        Internet Explorer 9 +
        Chrome 33 +
        Firefox 30 +
        Opera 23 +



Grunt：
    需要安装 node.js、npm
    需要安装 grunt npm install -g grunt-cli

        package.json
            用来存储已经作为npm模块发布的项目元数据(也就是依赖模块)。
            项目所依赖的Grunt(通常我们在这里配置Grunt版本)和Grunt插件(相应版本的插件)。

        Gruntfile.js
            用于配置或者定义Grunt任务和加载Grunt插件。

        .csslintrc
            css 语法规则配置文件
        .jshintrc
            js 语法规则配置文件

    配置好以上文件，然后按下面的步骤操作。
        1、将命令行的当前目录转到项目的根目录下。
        2、执行 npm install 命令安装项目依赖的库。
        3、执行 grunt 命令。