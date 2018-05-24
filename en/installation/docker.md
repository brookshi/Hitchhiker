**dependencies: docker, docker-compose**

Hitchhiker setting refer to: [Configuration](configuration.md), environment variable could be set in docker-compose.yml.
If you want to use another port, should replace all 8080.

```yaml
version: '2'
services:
  hitchhiker:
    image: brookshi/hitchhiker:v0.12
    container_name: hitchhiker
    environment:
      - HITCHHIKER_DB_HOST=hitchhiker-mysql
      - HITCHHIKER_APP_HOST=http://localhost:8080/
      # set environment variable here
    ports:
      - "8080:8080"
      - "11010:11010"
    volumes:
      - /my/hitchhiker/data:/usr/src/Hitchhiker/build/global_data/project
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

#### Deploy step by step:
``` bash

# create folder
mkdir hitchhiker
cd hitchhiker

# download docker-compose & mysql.conf file from github
curl -O https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/docker/hitchhiker_and_mysql/docker-compose.yml -O https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/docker/hitchhiker_and_mysql/hitchhiker-mysql.cnf

# edit docker-compose.yml file
sudo vim docker-compose.yml
# replace localhost to your host ip/domain and save&quit
...

# docker-compose up
sudo docker-compose up -d

# test
curl http://ip:8080/
```