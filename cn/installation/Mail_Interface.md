Hitchhiker 会在邀请Project成员或跑Schedule时发送邮件，用的是一个外部的邮箱系统，但是用户的服务器经常不能访问外网，所以Hitchhiker提供了两种自定义mail方式。

自定义Mail可以在安装前使用环境变量配置，具体的参数如下：

```json
 {
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
```

把相关环境变量写到 docker-compose.yml（使用docker部署）或 pm2.json(使用源码部署)里面

#### 使用SMTP

比如使用QQ的邮箱需要写入以下环境变量：
```json
HITCHHIKER_MAIL_CUSTOM_TYPE: "smtp"
HITCHHIKER_MAIL_SMTP_HOST: "smtp.qq.com"
HITCHHIKER_MAIL_SMTP_PORT: 465
HITCHHIKER_MAIL_SMTP_TLS: "1"
HITCHHIKER_MAIL_SMTP_USER: "xxx@qq.com"
HITCHHIKER_MAIL_SMTP_PASS: "xxx"
```

#### 使用Mail接口

使用自定义接口需要加入以下环境变量：
```json
HITCHHIKER_MAIL_CUSTOM_TYPE: "api"
HITCHHIKER_MAIL_API: "you api"
```

Hitchhiker 发送邮件时post的数据格式:
```json
{
    "target": "emails",
    "subject": "title", 
    "content": "content"
} 
```
