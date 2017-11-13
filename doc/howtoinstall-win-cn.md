
#### 系统的参数可以参考：[app setting](app-setting.md), 环境变量可以写到pm2.json里

1. 安装nodejs 7.10+, 并更新npm到最新`npm install npm -g`

2. 安装`mysql 5.7+` ，设置用户名 `root` 密码 `hitchhiker888` 

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

8. 等待完成，在浏览器访问`ip:port`测试
