Pre Request Script是定义在Request里，会在Request请求发送前运行，可以在这里做些数据的准备以及修改Request请求的内容。

例如，你可以在请求发送前，添加一个hash签名到请求的url或者给请求加个时间戳的header。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/script/script_pre_script.png)

脚本API参考: [脚本API](API-cn.md).