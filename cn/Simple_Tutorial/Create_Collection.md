#### 创建一个collection

现在我们有了一个Project，可以开始在这个Project下面创建Collection了。

Collection 可以说是很多请求的集合，在Collection下面还可以创建文件夹，然后把Request组织起来。

Collection同时也是Schedule和Stress Test跑的单位。

创建一个Collection步骤:

1. 进入Collection模块.

2. 单击`create collection`按钮

3. 在对话框里输入名字 `Sample Collection` 然后选择前面我们创建的Project `SampleAPI`

4. 点击OK，完成创建

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/collection_create.png)

Collection创建好后，同Project的成员都可以看到这个新创建的Collection。

#### Collection 菜单功能

1. 创建文件夹

2. Common Pre Request Script, 参考 [脚本](../Script/Common_Pre_Script-cn.md)

3. Request Strict SSL: 勾上的话，这个Collection下的所有请求都会验证SSL证书

4. Request Follow Redirect: 勾上的话，所有请求的3xx返回都会跟随自动跳转的请求。