set NODE_ENV=develop
git clone -b release https://github.com/brookshi/Hitchhiker.git
cd hitchhiker
call npm install
cd client
call npm install
cd..

set NODE_ENV=production
call gulp package --prod

