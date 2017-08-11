export HITCHHIKER_VERSION="v0.1.0"
sudo docker pull registry.us-east-1.aliyuncs.com/brook/hitchhiker:$HITCHHIKER_VERSION
sudo docker login --username=brookshi --password=$DOCKER_ID_PWD
sudo docker tag registry.us-east-1.aliyuncs.com/brook/hitchhiker:$HITCHHIKER_VERSION brookshi/hitchhiker:$HITCHHIKER_VERSION
sudo docker push brookshi/hitchhiker