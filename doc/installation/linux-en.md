
#### app setting reference to：[app setting](app-setting.md), environment variable could be set in pm2.json

1. install nodejs 7.60+, recommend use LTS (8.9), update npm to latest`npm install npm -g`

2. install `mysql 5.7+` with name `root` password `hitchhiker888` 

3. mysql, create db: `hitchhiker-prod`，change mysql variable `max_allowed_packet=200M`
> create DB: CREATE DATABASE IF NOT EXISTS \`hitchhiker-prod\` default charset utf8 COLLATE utf8_general_ci;
> change variable: add `max_allowed_packet=200M` under [mysqld] section in /my.conf file, refer to：[change max_allowed_packet](https://stackoverflow.com/questions/8062496/how-to-change-max-allowed-packet-size)

4. download linux_deploy.sh [https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/linux_deploy.sh](https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/linux_deploy.sh)

5. edit `linux_deploy.sh`，change `myhost` value to your ip:port，eg：`http://ip:port/`, if use BSD/OSX, remember use `sed -i '' "s#myhost#$myhost#g" pm2.json` instead of `sed -i "s#myhost#$myhost#g" pm2.json`

6. exec `source ./linux_deploy.sh`

7. complete，test `ip:port` in chrome 
