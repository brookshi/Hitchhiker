Hitchhiker 拥有一个超强的脚本系统，你可以在请求发送前或发送后对请求进行改造，可以在在请求前引入一些库，比如加密库来做一个准备工作。

Hitchhiker 不仅支持一些内置的脚本库，强大之外在于支持上传脚本库，也就是说只要nodejs能做的，这里都可以做，甚至操作数据库都没有问题。

Hitchhiker有三个级别的脚本：

1. Project级别的 [Global function](Global_Func.md).

2. Collection级别的 [Common Pre Request Script](Common_Pre_Script.md).

3. Request级别的 [Pre Request Script](Pre_Script.md) 以及 [Test Script](Test.md).

脚本都是用Javascript来写的，支持ES6和部分ES7，取诀于Server的Nodejs版本支持情况 (压力测试不支持ES6以及Pre Request Script，会尽快支持)

脚本的API参考：[脚本API](API.md).

自定义脚本库参考：[自定义脚本库](custom-javascript-lib.md).

预定义的数据参考：[自定义数据文件](custom-data-file.md).

下面这幅图展示了请求从开始到结束，整个过程脚本、变量的应用

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/script/reuqest_wf.png)