1. install nodejs 7.10+, update npm to latest`npm install npm -g`
2. install `mysql 5.6+` with name `root` password `hitchhiker888` 
3. mysql, create db: `hitchhiker-prod` (use \`)，change mysql variable `max_allowed_packet=200*1024*1024`
4. download [win_deploy.bat](https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/win_deploy.bat)
5. right click `win_deploy.bat` and open it with notepad，change `host` value to your ip:port，eg：`http://ip:port/`
6. double click `win_deploy.bat` file
7. complete，test in chrome `ip:port`