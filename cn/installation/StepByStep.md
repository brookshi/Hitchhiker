系统的参数可以参考：[配置文件](configuration.md), 环境变量可以写到pm2.json里

### 重要：如果是升级，记得保留build目录下的pm2.json，这里有你所有的配置，如果覆盖了需要重新设置

```json
{
    "apps": [{
        "name": "hitchhiker",
        "script": "./build/index.js",
        "watch": false,
        "env": {
            "HITCHHIKER_APP_HOST": "myhost"
            # 在这里写入环境变量
        }
    }]
}
```

#### 一步一步部署:

先确保机器有安装: nodejs 7.60+, 推荐用最新LTS版本（8.9） 以及数据库 `mysql 5.7+` (支持json列);

> 进入mysql， 创建db: `hitchhiker-prod`或其他名字（注意编码用utf8），修改变量`max_allowed_packet=200M`
> 创建DB的脚本: CREATE DATABASE IF NOT EXISTS \`hitchhiker-prod\` default charset utf8 COLLATE utf8_general_ci;
> 修改变量需要把`max_allowed_packet=200M`加到 my.ini 文件[mysqld] Section下，具体参考：[change max_allowed_packet](https://stackoverflow.com/questions/8062496/how-to-change-max-allowed-packet-size)

1. 下载安装包 [https://github.com/brookshi/Hitchhiker/releases/download/v0.9/Hitchhiker.zip](https://github.com/brookshi/Hitchhiker/releases/download/v0.9/Hitchhiker.zip); 
下载速度慢的可以去阿里云下载 http://hitchhiker.oss-cn-hongkong.aliyuncs.com/Hitchhiker.zip

2. 解压并在build目录下（即setup.js的目录）执行命令`node setup.js`(windows), `sudo node setup.js`(linux);

3. 在浏览器中访问 `http://localhost:9527/setup_cn.html`;

4. 一步一步输入ip, 端口， DB设置等（有红色*号表示必须设置的，其他可以默认）;

5. 提交，等待5秒后自动跳转;

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/setup.png)


#### 安装过程可能出现的问题
-----
**问：** 提交后跳转不成功

**答：** 安装过程出错，看看server的命令行有什么提示，一般是权限相关问题。

-----
**问：**启动后一直再转圈

**答：**可能是数据库连不上导致，先查看在当前机器上是否能访问数据库；也有可能是连接数据库出错导致，请确保数据库支持json列。

-----
**问：**Windows系统下启动后弹出好几个窗口

**答：**正常现象，pm2启动的，如果想避免弹窗，可以考虑把pm2注册成服务。

-----
**问：**登录不进去，日志提示table header exist之类
**答：**自动创建表时出错，执行pm2 restart hitchhiker可以解决
