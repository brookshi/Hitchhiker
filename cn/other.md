#### 自动同步数据

Hitchhiker会自动把Project下任一成员的修改同步给所有人，默认的同步时间间隔为30秒，你可以在`appconfig.json`文件中修改， 或者在部署时设置环境变量 `HITCHHIKER_SYNC_INTERVAL`。

具体结节参考：[Configuration](installation/configuration.md)

#### 浏览器端的本地数据缓存

在Hitchhiker页面上所有的操作和修改都会自动保存到浏览器的缓存里，所以不用担心在你不小心刷新浏览器或关掉电脑后没保存的修改会丢失，Hitchhiker会帮你把这些都记录下，再次打开一切都会回来。