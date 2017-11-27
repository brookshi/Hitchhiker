Hitchhiker的很多设置可以在appconfig.json里设置，也有对应的环境变量可以用在docker或pm2.json中，环境变量是boolean时，用 1 表示true, 0 表示false

``` json
{
    "app": {
        "env": "DEV",
        "host": "http://localhost:3000/",   // 设置运行的ip和端口， 环境变量：HITCHHIKER_APP_HOST
        "api": "http://localhost:81/api/",  // API接口，调试用， 环境变量使用上面的
        "language": "en",  // 语言，目前只对邮件内容起作用， HITCHHIKER_APP_LANG
        "encryptKey": "hitchhikerapi",  
        "defaultPassword": "123456",  // 新帐号的默认密码
        "tempUser": "test@test.test", // use without login时使用的用户账号
        "tempDelKey": "test",
        "sync": false,  // 是否支持同步，HITCHHIKER_SYNC_ONOFF
        "syncInterval": 30,  // 同步间隔，单位(秒) HITCHHIKER_SYNC_INTERVAL
        "defaultHeaders": [  // 请求默认带的headers,  HITCHHIKER_DEFAULT_HEADERS
            "Accept:*/*",
            "User-Agent:Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
            "Cache-Control:no-cache"
        ],
        "scriptTimeout": 60000, // 脚本执行时间（毫秒） HITCHHIKER_SCRIPT_TIMEOUT
        "safeVM": false,  // 是否使用安全脚本，如require  HITCHHIKER_SAFE_VM
        "enableUpload": true  // 是否支持上传脚本和数据， HITCHHIKER_ENABLE_UPLOAD
    },
    "db": {  
        "host": "localhost",  // mysql 的host,  HITCHHIKER_DB_HOST
        "port": 3306,  // mysql端口, HITCHHIKER_DB_PORT
        "username": "root",  // mysql 用户名, HITCHHIKER_DB_USERNAME
        "password": "hitchhiker888", // mysql密码, MYSQL_ROOT_PASSWORD
        "database": "hitchhiker"  // mysql 数据库, MYSQL_DATABASE
    },
    "schedule": {
        "duration": 60, // schedule 监测时间间隔（秒）  HITCHHIKER_SCHEDULE_DURATION
        "storeMaxCount": 50, // schedule 列表最大长度   HITCHHIKER_SCHEDULE_COUNT
        "mailOnlyForFail": true // 只在失败时发邮件   HITCHHIKER_SCHEDULE_MAILFORFAIL
    },
    "stress": {
        "storeMaxCount": 5,  // 压力测试表最大长度  HITCHHIKER_STRESS_COUNT
        "stressPort": 11010,  // 压力测试的端口  HITCHHIKER_STRESS_PORT
        "stressUpdateInterval": 1000  // 压力测试实时更新时的间隔（毫秒）  HITCHHIKER_STRESS_UPDATE_INTERVAL
    },
    "user": {
        "registerMailConfirm": false  // 注册是否需要邮箱验证
    },
    "mail": {
        "host": "http://email.hitchhiker-api.com/api/mail/",  // mail默认接口
        "custom": false,  // 是否需要自定义mail接口  HITCHHIKER_MAIL_CUSTOM
        "customApi": "http://"  // 自定义的mail接口, Hitchhiker会post {target, subject, content}到这个接口  HITCHHIKER_MAIL_API
    }
}
```