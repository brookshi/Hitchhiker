一般来说，我们的API会有好几个环境分别用来开发，测试以及上线等，这些环境下会有不同的域名，header等。

如果每个环境都写一份API的话就太过麻烦了，且维护起来极为不易，不过在Hitchhiker中，使用环境变量就可以在一份API中轻松处理这种情况：在`Environment`里定义变量然后在`Request`来使用，在发送请求前选择不同的环境来取得不同环境的结果。

#### 创建Environment

回到Project模块来创建2个Environment:

1. 单击 `New Environment` 按钮.

2. 在弹出的对话框里输入名字：`QA`

3. 输入变量 key: `env`, value: `qa`.

4. 单击OK按钮完成

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/env_create.png)

在Environment列表中可以看到我们刚创建出来的一行，单击`Duplicate`按钮来得到一份拷贝，然后点击`edit`按钮来编辑它。

1. 把名字改为`UAT`

2. 改变env变量的value为: `uat`.

3. 单击OK按钮完成

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/env_create_2.png)

#### 使用Environment

现在就创建好了QA和UAT两个环境，继续转到Collection模块来使用它们。

选择之前创建的Request `Sample Request`，现在的url是: `http://httpbin.org/post?env=qa`，把url里的qa改为变量名：`{{env}}`，现在整个url就是：`http://httpbin.org/post?env={{env}}`. 

这里展示了变量的使用方式，把变量的key用`{{}}`包起来使用，然后在请求发送前，Hitchhiker会把这些变量的key替换成对应环境下的value。

好了，现在可以测试一下。在页面右上角的环境选择框里选择QA环境，单击Send按钮查看返回来的结果：

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/env_qa.png)

再把环境换成UAT，再次Send并查看返回结果：

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/env_uat.png)

很明显，`{{env}}` 在使用不同的环境时被替换成了不同的值，这正是环境变量的意义所在。