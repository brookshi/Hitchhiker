## dependencies: docker, docker-compose

### Below is a sample:
``` bash

# create folder
mkdir hitchhiker
cd hitchhiker

# download docker-compose & mysql.conf file from github
curl -O https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/docker/hitchhiker_and_mysql/docker-compose.yml -O https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/docker/hitchhiker_and_mysql/hitchhiker-mysql.conf

# edit docker-compose.yml file
sudo vim docker-compose.yml
# replace localhost to your host ip/domain and save&quit
...

# docker-compose up
sudo docker-compose up -d

# test
curl http://ip:8080/
```