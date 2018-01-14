系统的参数可以参考：[配置文件](configuration.md), 环境变量可以写到pm2.json里

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

1. 下载安装包 ;

2. 解压并在build目录下（即setup.js的目录）执行命令`node setup.js`;

3. 在浏览器中访问 `http://localhost:9527/setup_cn.html`;

4. 一步一步输入ip, 端口， DB设置等（有红色*号表示必须设置的，其他可以默认）;

5. 提交，完成;