There are several setting that you can use while deploying，set Environment variable in docker-compose.yml or pm2.json.

when type of variable is boolean, use 1 for true and 0 for false.

``` json
{
    "app": {
        "env": "DEV",
        "host": "http://localhost:3000/",   // set ip and port， Env Variable：HITCHHIKER_APP_HOST
        "port": 8080,  // port, use for nginx   HITCHHIKER_APP_PORT
        "api": "http://localhost:81/api/",  // API interface, used for debug， Env Variable same as above
        "language": "en",  // language, en for english, zh for chinese, HITCHHIKER_APP_LANG
        "encryptKey": "hitchhikerapi",  
        "encryptPassword": false,  // encrypt password of user account,  HITCHHIKER_ENCRYPT_PASSWORD
        "defaultPassword": "123456",  // default password for new user
        "tempUser": "test@test.test", // email for `use without login`
        "tempDelKey": "test",
        "sync": false,  // auto sync data switch, HITCHHIKER_SYNC_ONOFF
        "syncInterval": 30,  // sync interval (second), minimum value is 10, HITCHHIKER_SYNC_INTERVAL
        "defaultHeaders": [  // default request's headers,  HITCHHIKER_DEFAULT_HEADERS
            "Accept:*/*",
            "User-Agent:Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
            "Cache-Control:no-cache"
        ],
        "requestTimeout": 1800000, // request timeout (ms),  HITCHHIKER_APP_SCRIPT_TIMEOUT
        "scriptTimeout": 60000, // script timeout (ms), HITCHHIKER_SCRIPT_TIMEOUT
        "safeVM": false,  // run script in safe VM, eg: require,  HITCHHIKER_SAFE_VM
        "enableUpload": true,  // enable upload js lib or data, HITCHHIKER_ENABLE_UPLOAD
        "inviteMemberDirectly": true // invite member without mail verification,  HITCHHIKER_APP_INVITE_DIRECTLY
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
        "storeUnit": "count", // store unit, HITCHHIKER_SCHEDULE_STORE_UNIT
        "storeLimit": 50, // store limit, HITCHHIKER_SCHEDULE_STORE_LIMIT
        "storeContent": "forFail",  // value: none, forFail, all; store body/header condition,  HITCHHIKER_SCHEDULE_STORE_CONTENT
        "pageSize": 20  // schedule page size in browser,  HITCHHIKER_SCHEDULE_PAGESIZE
    },
    "stress": {
        "type": "node",  // stress type, support node and go,  HITCHHIKER_STRESS_TYPE
        "storeMaxCount": 5,  // max length of stress test list, HITCHHIKER_STRESS_COUNT
        "stressHost": "",  // host of stress test，if empty, use host of app without port, HITCHHIKER_STRESS_HOST
        "stressPort": 11010,  // port of stres test, HITCHHIKER_STRESS_PORT
        "stressUpdateInterval": 1000  // stress test update interval (second), HITCHHIKER_STRESS_UPDATE_INTERVAL
    },
    "user": {
        "registerMailConfirm": false  // need mail confirm for register
    },
    "mail": {
        "host": "http://email.hitchhiker-api.com/api/mail/",  // mail default interface
        "customType": "none",  // custom mail: support "api" or "smtp", HITCHHIKER_MAIL_CUSTOM_TYPE
        "customApi": "http://",  // if custom is "api", this custom mail interface will be available, Hitchhiker will post {target, subject, content} to this interface  HITCHHIKER_MAIL_API
        "smtp": {  // if custom is "smtp", hitchhiker will use this smtp config, Note: some company use its internal mail host without user and pass, this config MUST empty user and pass too.
            "host": "smtp.qq.com", // HITCHHIKER_MAIL_SMTP_HOST
            "port": 465,  // HITCHHIKER_MAIL_SMTP_PORT
            "tls": true,  // need TLS or not， HITCHHIKER_MAIL_SMTP_TLS
            "user": "***@qq.com",  // smtp user： HITCHHIKER_MAIL_SMTP_USER
            "pass": "****",  // smtp password： HITCHHIKER_MAIL_SMTP_PASS
            "from": "",  // default use user， HITCHHIKER_MAIL_SMTP_From
            "nickname": "",  //  HITCHHIKER_MAIL_SMTP_NICKNAME
            "rejectUnauthorized": false  //  HITCHHIKER_MAIL_SMTP_RU
        }
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