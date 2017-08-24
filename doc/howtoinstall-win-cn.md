1. 安装nodejs 7.10+, 并更新npm到最新`npm install npm -g`
2. 安装`mysql 5.6+` ，设置用户名 `root` 密码 `hitchhiker888` 
3. 进入mysql， 创建db: `hitchhiker-prod` (使用\`符号包起来)，修改变量`max_allowed_packet=200*1024*1024`
4. 下载 [win_deploy.bat](https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/win_deploy.bat)
5. 右键用记事本打开`win_deploy.bat`，修改第一行的`host`变量值为你的ip加端口，格式：`http://ip:port/`
6. 双击运行`win_deploy.bat`文件
7. 完成，在浏览器访问`ip:port`测试