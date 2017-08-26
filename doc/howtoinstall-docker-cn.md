## 首先要确保你的机器上安装有docker及docker-compose

### 参考使用下面命令，一步一步安装:
``` bash

# 创建一个文件夹
mkdir hitchhiker
cd hitchhiker

# 从github上下载docker-compose.yml以及mysql.conf文件
curl -O https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/docker/hitchhiker_and_mysql/docker-compose.yml -O https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/docker/hitchhiker_and_mysql/hitchhiker-mysql.conf

# 编辑 docker-compose.yml， 把localhost换成你机器的局域网ip，如果是只有本机一个人用那就localhost也可以
sudo vim docker-compose.yml
# 修改完成后，保存退出
...

# 执行docker-compose up安装镜像
sudo docker-compose up -d

# 成功后可以测试下
curl http://ip:8080/
```