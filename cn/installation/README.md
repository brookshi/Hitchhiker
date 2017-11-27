Hitchhiker 是一个基于Nodejs的跨平台Web程序，你可以部署到 Linux, Mac or Windows。
另外，Hitchhiker 在Docker Hub上也有镜像可以使用，所以推荐的方式还是用Docker来部署，不论是首次还是以后升级都会更容易。

Hitchhiker 有很多参数可以在部署时设置，参考：[配置文件](configuration.md)。

1. [Docker](docker.md)

2. [Linux](linux.md)

3. [Windows](win.md)

Hitchhiker 会在邀请Project成员或跑Schedule时发送邮件，用的是一个外部的邮箱系统，但是用户的服务器经常不能访问外网，所以Hitchhiker 提供了一个自定义的Mail接口，具体参考：[自定义邮箱接口](Mail_Interface.md)。