curl -O https://raw.githubusercontent.com/brookshi/Hitchhiker/release/deploy/docker/hitchhiker/docker-compose.yml
sed -i "s#localhost:8080#www.hitchhiker-api.com#g" docker-compose.yml
sed -i "s/\#//g" docker-compose.yml
rm -r /usr/src/Hitchhiker/build/public/
cp -rf /usr/src/Hitchhiker/client/build/ /usr/src/Hitchhiker/build/public/
pm2 restart index