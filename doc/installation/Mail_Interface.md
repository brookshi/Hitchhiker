Hitchhiker use a internet mail service to send email for Project member invitation and Schedule run result. But some user's server can't access internet, so Hitchhiker support a custom mail notification  interface.

You can set it in [appconfig.json](configuration.md) `mail.custom: true, mail.customApi:{your mail api}` or use environment variable: `HITCHHIKER_MAIL_CUSTOM = true, HITCHHIKER_MAIL_API='your mail api'`.

Hitchhiker will post data {target, subject, content} to this mail api.
