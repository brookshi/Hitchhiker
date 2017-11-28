**确保你的机器上安装有docker及docker-compose**

系统的参数可以参考：[配置文件](configuration.md), 环境变量可以写到docker-compose.yml里

```yaml
version: '2'
services:
  hitchhiker:
    image: brookshi/hitchhiker:v0.5
    container_name: hitchhiker
    environment:
      - HITCHHIKER_DB_HOST=hitchhiker-mysql
      - HITCHHIKER_APP_HOST=http://localhost:8080/
      # 在这里写入环境变量
    ports:
      - "8080:8080"
      - "11010:11010"
    links:
      - hitchhiker-mysql:hitchhiker-mysql
  hitchhiker-mysql:
    image: mysql:5.7
    container_name: hitchhiker-mysql
    environment:
      - MYSQL_ROOT_PASSWORD=hitchhiker888
      - MYSQL_DATABASE=hitchhiker-prod
    volumes:
      - ./hitchhiker-mysql.cnf:/etc/mysql/conf.d/hitchhiker.cnf
      - /my/hitchhiker/sqldata:/var/lib/mysql
```

#### 参考使用下面命令，一步一步部署:
``` bash

# 创建一个文件夹
mkdir hitchhiker
cd hitchhiker

# 从github上下载docker-compose.yml以及mysql.conf文件
curl -O https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/docker/hitchhiker_and_mysql/docker-compose.yml -O https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/docker/hitchhiker_and_mysql/hitchhiker-mysql.cnf

# 编辑 docker-compose.yml， 把localhost换成你机器的局域网ip，如果是只有本机一个人用那就localhost也可以
sudo vim docker-compose.yml
# 修改完成后，保存退出
...

# 执行docker-compose up安装镜像
sudo docker-compose up -d

# 成功后可以测试下
curl http://ip:8080/
```