myhost="http://10.86.18.215:8080/"

git clone -b release https://github.com/brookshi/Hitchhiker.git
cd hitchhiker
npm install -g pm2 yarn gulp-cli typescript@2.3.3 
npm install gulp -D
npm install
cd client
npm install
cd ..

gulp release --prod

sed -i 's/myhost/${myhost}/g' pm2.json

pm2 start ./pm2.json --env production