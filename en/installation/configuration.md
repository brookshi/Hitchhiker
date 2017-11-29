There are several setting that you can use while deploying，set Environment variable in docker-compose.yml or pm2.json.

when type of variable is boolean, use 1 for true and 0 for false.

``` json
{
    "app": {
        "env": "DEV",
        "host": "http://localhost:3000/",   // set ip and port， Env Variable：HITCHHIKER_APP_HOST
        "api": "http://localhost:81/api/",  // API interface, used for debug， Env Variable same as above
        "language": "en",  // language, only support mail right now, HITCHHIKER_APP_LANG
        "encryptKey": "hitchhikerapi",  
        "defaultPassword": "123456",  // default password for new user
        "tempUser": "test@test.test", // email for `use without login`
        "tempDelKey": "test",
        "sync": false,  // auto sync data switch, HITCHHIKER_SYNC_ONOFF
        "syncInterval": 30,  // sync interval (second), HITCHHIKER_SYNC_INTERVAL
        "defaultHeaders": [  // default request's headers,  HITCHHIKER_DEFAULT_HEADERS
            "Accept:*/*",
            "User-Agent:Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
            "Cache-Control:no-cache"
        ],
        "scriptTimeout": 60000, // script timeout (ms), HITCHHIKER_SCRIPT_TIMEOUT
        "safeVM": false,  // run script in safe VM, eg: require,  HITCHHIKER_SAFE_VM
        "enableUpload": true  // enable upload js lib or data, HITCHHIKER_ENABLE_UPLOAD
    },
    "db": {  
        "host": "localhost",  // host of mysql, HITCHHIKER_DB_HOST
        "port": 3306,  // port of mysql, HITCHHIKER_DB_PORT
        "username": "root",  // user of mysql, HITCHHIKER_DB_USERNAME
        "password": "hitchhiker888", // password of mysql, MYSQL_ROOT_PASSWORD
        "database": "hitchhiker"  // db name of mysql, MYSQL_DATABASE
    },
    "schedule": {
        "duration": 60, // schedule check interval (second), HITCHHIKER_SCHEDULE_DURATION
        "storeMaxCount": 50, // max length of schedule list, HITCHHIKER_SCHEDULE_COUNT
        "mailOnlyForFail": true // only send schedule mail if failed, HITCHHIKER_SCHEDULE_MAILFORFAIL
    },
    "stress": {
        "storeMaxCount": 5,  // max length of stress test list, HITCHHIKER_STRESS_COUNT
        "stressPort": 11010,  // port of stres test, HITCHHIKER_STRESS_PORT
        "stressUpdateInterval": 1000  // stress test update interval (second), HITCHHIKER_STRESS_UPDATE_INTERVAL
    },
    "user": {
        "registerMailConfirm": false  // need mail confirm for register
    },
    "mail": {
        "host": "http://email.hitchhiker-api.com/api/mail/",  // mail default interface
        "custom": false,  // need custom mail interface, HITCHHIKER_MAIL_CUSTOM
        "customApi": "http://"  // custom mail interface, Hitchhiker will post {target, subject, content} to this interface  HITCHHIKER_MAIL_API
    }
}
```

Setting for database:

```json
HITCHHIKER_DB_HOST: database host
HITCHHIKER_DB_PORT: database port
HITCHHIKER_DB_USERNAME： database username
MYSQL_ROOT_PASSWORD: database password
MYSQL_DATABASE： database name
```