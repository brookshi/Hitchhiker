1. install nodejs 7.10+, update npm to latest`npm install npm -g`
2. install `mysql 5.6+` with name `root` password `hitchhiker888` 
3. mysql, create db: `hitchhiker-prod` (use \`)，change mysql variable `max_allowed_packet=200*1024*1024`
4. download [linux_deploy.sh](https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/linux_deploy.sh)
5. open `linux_deploy.sh` with vim，change `myhost` value to your ip:port，eg：`http://ip:port/`
6. exec `source ./linux_deploy.sh`
7. complete，test `ip:port` in chrome 