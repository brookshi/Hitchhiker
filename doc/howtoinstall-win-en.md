
1. install nodejs 7.10+, update npm to latest`npm install npm -g`

2. install `mysql 5.6+` with name `root` password `hitchhiker888` 

3. mysql, create db: `hitchhiker-prod`，change mysql variable `max_allowed_packet=200M`
> create DB: CREATE DATABASE IF NOT EXISTS `hitchhiker-prod` default charset utf8 COLLATE utf8_general_ci;
> change variable: add `max_allowed_packet=200M` under [mysqld] section in my.ini file, refer to：[change max_allowed_packet](https://stackoverflow.com/questions/8062496/how-to-change-max-allowed-packet-size)

4. download [win_deploy.bat](https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/win_deploy.bat)

5. right click `win_deploy.bat` and open it with notepad，change `host` value to your ip:port，eg：`http://ip:port/`

6. please skip this step if you don't want to install Hitchhiker as a windows service. commented out `pm2 start pm2.json` line in win_deploy.bat and uncomment `pm2-service-install -n hitchhiker-api`, command will prompt you to set some environment variables, refer to：[https://github.com/jon-hall/pm2-windows-service](https://github.com/jon-hall/pm2-windows-service), here is a sample in my PC：
``` 
hitchhiker-ps-prod is parent dictionary of cloned Hitchhiker
F:\APPLICATION\NODE-V7.10.0-WIN-X64\NODE-V7.10.0-WIN-X64 is nodejs folder
```
> PM2_HOME: E:\hitchhiker-ps-prod\pm2

> PM2_SERVICE_PM2_DIR: F:\APPLICATION\NODE-V7.10.0-WIN-X64\NODE-V7.10.0-WIN-X64\node_modules\pm2\index.js

> PM2_SERVICE_SCRIPTS: E:\hitchhiker-ps-prod\Hitchhiker\pm2.json 

7. double click (or right click and run as administrator for service) `win_deploy.bat` file

8. complete，test in chrome `ip:port`