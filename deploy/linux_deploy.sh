# ** 如果您打算部署Hitchhiker，请忽略这个脚本，部署请参考：http://doc.hitchhiker-api.com/cn/installation/  如果是开发，可以参考脚本搭开发环境
# ** if you try to deploy Hitchhiker, please ignore this file, reference to: http://doc.hitchhiker-api.com/cn/installation/ 
# ensure mysql is installed with user:'root' password: 'hitchhiker888' and create database 'hitchhiker-prod'
# replace myhost with your ip, keep 8080 port

myhost="http://10.86.18.215:8080/"

export NODE_ENV="develop"

git clone -b release https://github.com/brookshi/Hitchhiker.git
cd ./Hitchhiker
npm install -g pm2 yarn gulp-cli typescript@2.3.3
npm install gulp -D
npm install typescript@2.3.3 --save
npm install
cd ./client
npm install
cd ..

export NODE_ENV="production"

gulp release --prod

## for BSD/OSX use : sed -i '' "s#myhost#$myhost#g" pm2.json
sed -i "s#myhost#$myhost#g" pm2.json

sleep 10s

pm2 start ./pm2.json