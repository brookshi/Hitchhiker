如 [脚本API](API-cn.md) 所提，Hitchhiker支持上传自定义的js脚本库。

在Project的菜单有一项叫`Project Lib`，单击它会弹出一个js库管理对话框：

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/script/script_lib.png)

你可以先去NPM找到你想要用的js库，下载下来（最好是转成单文件），打包成zip，然后通过点击上传按钮来上传这个库，上传完成后可以在列表里看到该项。

然后就可以通过在脚本里使用`require`来引用及使用这个库了。
