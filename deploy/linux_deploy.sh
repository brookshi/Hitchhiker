# ensure mysql is installed with user:'root' password: 'hitchhiker888' and create database 'hitchhiker-prod'
# replace myhost with your ip, keep 8080 port

myhost="http://10.86.18.215:8080/"

export NODE_ENV="develop"

git clone -b release https://github.com/brookshi/Hitchhiker.git
cd ./Hitchhiker
npm install -g pm2 yarn gulp-cli typescript@2.3.3 
npm install gulp -D
npm install
cd ./client
npm install
cd ..

export NODE_ENV="production"

gulp release --prod

sed -i 's/myhost/'$myhost'/g' pm2.json

sleep 10s

pm2 start ./pm2.json