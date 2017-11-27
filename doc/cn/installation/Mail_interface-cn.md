Hitchhiker 会在邀请Project成员或跑Schedule时发送邮件，用的是一个外部的邮箱系统，但是用户的服务器经常不能访问外网，所以Hitchhiker 提供了一个自定义的Mail接口。

自定义的接口在 [appconfig.json](configuration-cn.md) 文件里配置，属性是 `mail.custom: true, mail.customApi:{your mail api}`， 或者你也可以在部署时写到环境变量里，Hitchhiker 会优先读取环境变量的设置: `HITCHHIKER_MAIL_CUSTOM = true, HITCHHIKER_MAIL_API='your mail api'`。

Hitchhiker 发送邮件时post的数据格式:
```json
{
    "target": "emails",
    "subject": "title", 
    "content": "content"
} 
```
