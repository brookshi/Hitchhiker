Hitchhiker 是一个基于Nodejs的跨平台Web程序，你可以部署到 Linux, Mac or Windows。
另外，Hitchhiker 在Docker Hub上也有镜像可以使用，所以推荐的方式还是用Docker来部署，不论是首次还是以后升级都会更容易。

Hitchhiker 有很多参数可以在部署时设置，参考：[配置文件](configuration.md)。
默认是英文版,中文版需要加入环境变量HITCHHIKER_APP_LANG=zh, 具体怎样加环境变量,请参考各自的安装文档.

1. [Docker](docker.md) (强烈推荐的方式，简单且升级方便)

2. [安装包](StepByStep.md)

Hitchhiker 会在邀请Project成员或跑Schedule时发送邮件，用的是一个外部的邮箱系统，但是用户的服务器经常不能访问外网，所以Hitchhiker 提供了自定义Mail的方式，支持SMTP和API方式，具体参考：[自定义邮箱](Mail_Interface.md)。