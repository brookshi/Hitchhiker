系统的参数可以参考：[配置文件](configuration.md), 环境变量可以写到pm2.json里

#### 参考使用下面命令，一步一步部署:

1. 安装nodejs 7.60+, 推荐用最新LTS版本（8.9），并更新npm到最新`npm install npm -g`

2. 安装`mysql 5.7+` (需要支持json) ，设置用户名 `root` 密码 `hitchhiker888` （也可以设置成其他的，后面在pm2.json里使用环境变量）

3. 进入mysql， 创建db: `hitchhiker-prod`，修改变量`max_allowed_packet=200M`
> 创建DB: CREATE DATABASE IF NOT EXISTS \`hitchhiker-prod\` default charset utf8 COLLATE utf8_general_ci;
> 修改变量需要把`max_allowed_packet=200M`加到 my.ini 文件[mysqld] Section下，具体参考：[change max_allowed_packet](https://stackoverflow.com/questions/8062496/how-to-change-max-allowed-packet-size)

4. 下载 win_deploy.bat[https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/win_deploy.bat](https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/win_deploy.bat)

5. 右键用记事本打开`win_deploy.bat`，修改第一行的`host`变量值为你的ip加端口，格式：`http://ip:port/`

6. 如果不想安装成服务可以跳过此步，安装成服务需要注释掉win_deploy.bat的`pm2 start pm2.json`这行，打开这行`pm2-service-install -n hitchhiker-api`，安装成服务过程中会需要设置一些环境变量，具体可以参考：[https://github.com/jon-hall/pm2-windows-service](https://github.com/jon-hall/pm2-windows-service)，以我本机做了个例子：
> PM2_HOME: E:\hitchhiker-ps-prod\pm2  //这个指到clone下来的Hitchhiker目录下的pm2文件夹即可

> PM2_SERVICE_PM2_DIR: F:\APPLICATION\NODE-V7.10.0-WIN-X64\NODE-V7.10.0-WIN-X64\node_modules\pm2\index.js //这个指向nodejs安装目录的node_modules\pm2\index.js

> PM2_SERVICE_SCRIPTS: E:\hitchhiker-ps-prod\Hitchhiker\pm2.json  //这个指向clone下来的Hitchhiker目录中的pm2.json

7. 双击运行（如果要安装成服务需要右键管理员运行）`win_deploy.bat`文件

8. 等待完成

完成后先不着急使用，看是否需要再改下配置：

下面是Hitchhiker目录的pm2.json

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

#### 使用环境变量配置MySql

如果Mysql不想使用默认密码以及库名时可以在pm2.json里写入环境变量，比如host为192.168.0.10, 用户名为root，密码为123456，库名为test，参考：

```json
{
    "apps": [{
        "name": "hitchhiker",
        "script": "./build/index.js",
        "watch": false,
        "env": {
            "HITCHHIKER_APP_HOST": "myhost", // 这里应该不会是host了，不用管它
            "HITCHHIKER_DB_HOST": "192.168.0.10",
            "HITCHHIKER_DB_USERNAME": "root",
            "MYSQL_ROOT_PASSWORD": "123456",
            "MYSQL_DATABASE": "test"
        }
    }]
}
```