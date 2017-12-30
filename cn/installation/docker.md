docker使用的是docker-compose来安装，会自动下载两个image：hitchhiker和mysql，基本上按命令执行即可，如果需要配置，可以参考：[配置文件](configuration.md), 环境变量可以写到docker-compose.yml里

国内用户请使用阿里云的镜像 hitchhiker-cn：registry.cn-hangzhou.aliyuncs.com/brook/hitchhiker-cn:v0.6

#### 参考下面命令，一步一步部署 (基于ubuntu，其他系统类似):
``` bash

# 安装docker，如果已经安装请忽略
sudo apt update
sudo apt install docker.io

# 安装docker-compose，如果已经安装请忽略
sudo apt install docker-compose

# 创建一个文件夹
mkdir hitchhiker
cd hitchhiker

# 从github上下载docker-compose.yml以及mysql.conf文件
curl -O https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/docker/hitchhiker_and_mysql/docker-compose.yml -O https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/docker/hitchhiker_and_mysql/hitchhiker-mysql.cnf

# 编辑 docker-compose.yml， 把localhost换成你机器的局域网ip，如果是只有本机一个人用那就localhost也可以
sudo vim docker-compose.yml
# 修改完成后，保存退出 (国内用户改image地址：registry.cn-hangzhou.aliyuncs.com/brook/hitchhiker-cn:v0.6， 以及写入环境变量配置hitchhiker以及mysql)
...

# 执行docker-compose up安装镜像
sudo docker-compose up -d

# 成功后可以测试下
curl http://ip:8080/
```

下面是下载下来的docker-compose.yml的内容：
```yaml
version: '2'
services:
  hitchhiker:
    image: brookshi/hitchhiker:v0.6 
    container_name: hitchhiker
    environment:
      - HITCHHIKER_DB_HOST=hitchhiker-mysql
      - HITCHHIKER_APP_HOST=http://localhost:8080/ # should change before deploying.
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

#### 修改端口

端口修改需要改所有的8080，比如想使用6666端口，可以这样写：
```yml
version: '2'
services:
  hitchhiker:
    image: registry.cn-hangzhou.aliyuncs.com/brook/hitchhiker-cn:v0.6 
    container_name: hitchhiker
    environment:
      - HITCHHIKER_DB_HOST=hitchhiker-mysql
      - HITCHHIKER_APP_HOST=http://localhost:6666/ # 修改为本机ip及端口
    ports:
      - "6666:6666"
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
#### 使用自有mysql

如果你不想再下载mysql image，而使用已有的mysql，比如host为192.168.0.10, 用户名为root，密码为123456，库名为test，可以这样修改：
```yml
version: '2'
services:
  hitchhiker:
    image: registry.cn-hangzhou.aliyuncs.com/brook/hitchhiker-cn:v0.6 
    container_name: hitchhiker
    environment:
      - HITCHHIKER_DB_HOST=192.168.0.10
      - HITCHHIKER_APP_HOST=http://localhost:8080/ # 修改为本机ip及端口
      - HITCHHIKER_DB_USERNAME=root
      - MYSQL_ROOT_PASSWORD=123456
      - MYSQL_DATABASE=test
    ports:
      - "8080:8080"
      - "11010:11010"
```