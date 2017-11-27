Hitchhiker use a internet mail service to send email for Project member invitation and Schedule run result. But some user's server can't access internet, so Hitchhiker support a custom mail notification  interface.

You can set the custom mail api in [appconfig.json](configuration.md) `mail.custom: true, mail.customApi:{your mail api}` or use environment variable: `HITCHHIKER_MAIL_CUSTOM = true, HITCHHIKER_MAIL_API='your mail api'` while deploying.

Hitchhiker will post data to this mail api with data:
```json
{
    "target": "emails",
    "subject": "title", 
    "content": "content"
} 
```
