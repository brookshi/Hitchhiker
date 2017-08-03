set host=http://10.86.18.215:8080/

git clone -b release https://github.com/brookshi/Hitchhiker.git
cd hitchhiker
call npm install
cd client
call npm install
cd..
call gulp release --prod

@echo off&setlocal enabledelayedexpansion
for /f "eol=* tokens=*" %%i in (pm2.json) do (
set a=%%i
set "a=!a:$host=%host%!"
echo !a!>>$)
move $ pm2.json

pm2 start pm2.json --env production