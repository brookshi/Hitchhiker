Hitchhiker的很多设置可以在appconfig.json里设置，也有对应的环境变量可以用在docker或pm2.json中，环境变量是boolean时，用 1 表示true, 0 表示false

``` json
{
    "app": {
        "env": "DEV",
        "host": "http://localhost:3000/",   // 设置运行的ip和端口， 环境变量：HITCHHIKER_APP_HOST
        "port": 8080,  //  使用nginx做代理时可以使用这个端口  HITCHHIKER_APP_PORT
        "api": "http://localhost:81/api/",  // API接口，调试用， 环境变量使用上面的
        "language": "en",  // 语言，中文：zh， 英文：en， HITCHHIKER_APP_LANG
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
        "requestTimeout": 1800000, // 请求超时时间 (ms),  HITCHHIKER_APP_SCRIPT_TIMEOUT
        "scriptTimeout": 60000, // 脚本执行时间（毫秒） HITCHHIKER_SCRIPT_TIMEOUT
        "safeVM": false,  // 是否使用安全脚本，如require  HITCHHIKER_SAFE_VM
        "enableUpload": true,  // 是否支持上传脚本和数据， HITCHHIKER_ENABLE_UPLOAD
        "inviteMemberDirectly": true // 不通过邮件验证来邀请成员， HITCHHIKER_APP_INVITE_DIRECTLY
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
        "storeUnit": "count",  //schedule 存储的单位，支持按个数存 count 和按天存: day   HITCHHIKER_SCHEDULE_STORE_UNIT
        "storeLimit": 50, // schedule 存储的大小   HITCHHIKER_SCHEDULE_COUNT
        "storeContent": "forFail", // schedule record response 是否存储, all表示所有都存下来, forFail表示只存失败的, none表示都不存（这会很大影响数据库大小和性能）    HITCHHIKER_SCHEDULE_STORE_CONTENT
        "pageSize": 20,  // schedule record 在浏览器端显示的一页的个数   HITCHHIKER_SCHEDULE_PAGESIZE
        "mailOnlyForFail": true // 只在失败时发邮件   HITCHHIKER_SCHEDULE_MAILFORFAIL
    },
    "stress": {
        "stressType": "node", // 压力测试的类型，默认为node，内置的，还有go，需要部署hitchhiker-node，设为none时禁用
        "storeMaxCount": 5,  // 压力测试表最大长度  HITCHHIKER_STRESS_COUNT
        "stressPort": 11010,  // 压力测试的端口  HITCHHIKER_STRESS_PORT
        "stressUpdateInterval": 1000  // 压力测试实时更新时的间隔（毫秒）  HITCHHIKER_STRESS_UPDATE_INTERVAL
    },
    "user": {
        "registerMailConfirm": false  // 注册是否需要邮箱验证
    },
    "mail": {
        "host": "http://email.hitchhiker-api.com/api/mail/",  // mail默认接口
        "customType": "none",  // 是否需要自定义mail，可以使用 "api" 或 "smtp",  HITCHHIKER_MAIL_CUSTOM_TYPE
        "customApi": "http://",  // custom为"api"时会使用这个mail接口, Hitchhiker会post {target, subject, content}到这个接口  HITCHHIKER_MAIL_API
        "smtp": {  // custom为"smtp"时使用这块，下面是qq的一个例子作为参考，注意：有的公司内部邮件不需要用户名或密码验证则 user和pass需要空掉不写，否则会报错
            "host": "smtp.qq.com", // HITCHHIKER_MAIL_SMTP_HOST
            "port": 465,  // HITCHHIKER_MAIL_SMTP_PORT
            "tls": true,  // 是否需要走tls加密， HITCHHIKER_MAIL_SMTP_TLS
            "user": "***@qq.com",  // smtp用户名： HITCHHIKER_MAIL_SMTP_USER
            "pass": "****",  // smtp密码： HITCHHIKER_MAIL_SMTP_PASS
            "from": "",  // 发邮件的邮箱，默认空会使用user， HITCHHIKER_MAIL_SMTP_From
            "nickname": "",  //  昵称：  HITCHHIKER_MAIL_SMTP_NICKNAME
            "rejectUnauthorized": false  // 证书验证不通过时是否报错：  HITCHHIKER_MAIL_SMTP_RU
        }
    }
}
```

另外还有DB的一些设置如下：

```json
HITCHHIKER_DB_HOST: Database Server的ip
HITCHHIKER_DB_PORT: Database 的端口
HITCHHIKER_DB_USERNAME： Database的用户名
MYSQL_ROOT_PASSWORD: Database的密码
MYSQL_DATABASE： Database库名
```