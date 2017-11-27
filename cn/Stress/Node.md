[Hitchhiker-Node](https://github.com/brookshi/Hitchhiker-Node) 是一个独立的，基于Golang的，跨平台的应用程序。

你可以在[这里](https://github.com/brookshi/Hitchhiker-Node/releases) 下载到你想要平台的运行文件。下载完成解压后会有两个文件: Hitchhiker-Node是一个可执行文件，也是主体文件，另一个config.json 是一个配置文件，打开这个配置文件，把Address的值改了你部署Hitchhiker的ip，如(192.168.0.2:11010)。

现在你就可以在这台电脑上运行这个程序，它会连Hitchhiker server，当然，你也可以把这个文件放到多台电脑上去执行，这个在做压力测试时，系统会根据这些压力点的CPU核数来分配相应的任务，这样可以支持更大的压力。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/stress/stress_node.png)