Hitchhiker use a internet mail service to send email for Project member invitation and Schedule run result. But some user's server can't access internet, so Hitchhiker support two ways to customize your mail notification interface.

You should set environment variables as below to docker-compose.yml or pm2.json before deploying:

```json
 {
    "host": "http://email.hitchhiker-api.com/api/mail/",  // mail default interface
    "custom": "none",  // custom mail: support "api" or "smtp", HITCHHIKER_MAIL_CUSTOM
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
```

#### Use SMTP

eg: use gmail

```json
HITCHHIKER_MAIL_CUSTOM: "smtp"
HITCHHIKER_MAIL_SMTP_HOST: "smtp.gmail.com"
HITCHHIKER_MAIL_SMTP_PORT: 465
HITCHHIKER_MAIL_SMTP_TLS: "1"
HITCHHIKER_MAIL_SMTP_USER: "xxx@gmail.com"
HITCHHIKER_MAIL_SMTP_PASS: "xxx"
```

#### Use custom mail api

Relatived environment variables:

```json
HITCHHIKER_MAIL_CUSTOM: "api"
HITCHHIKER_MAIL_API: "you api"
```

Hitchhiker will post data as below to your api:
```json
{
    "target": "emails",
    "subject": "title", 
    "content": "content"
} 
```
