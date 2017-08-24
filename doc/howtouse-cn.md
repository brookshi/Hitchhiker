用过Postman的话应该非常容易入手。

### 概念：

`Request`: 一个Api请求，包括`name`, `url`, `method`, `headers`, `body`, `test`

> 前面几个大家都应该很熟悉，就不多说了，`test`是用来为请求回来的数据做校验的，内置变量有:
> - `responseBody`: 请求返回的字符串
> - `responseObj`：请求返回的json对象
> - `responseHeaders`: response返回头
> - `responseTime`: 请求到返回结果的时间间隔
> - `responseCode.code`: 请求状态码
> - `responseCode.name`: 请求状态名
> 在`test`里可以写javascript代码来对这些变量做校验，比如(支持ES6)：
> ```javascript
> tests["response success"] = responseJSON && responseJSON.success; 
> tests["response time is less than 200ms"] = responseTime < 200;
> ```

`Collection`: request的集合，也可以创建子目录（只支持一级），`Collection`也是批量跑的单位

`Project`: 项目是用来让Team成员一起管理`Collection`的，项目里面的属性有team成员和环境

> `Members`：使用email地址邀请成员，系统会自动发送邮件，成员收到邮件后点击`接受邀请`按钮即可加入项目，系统会自动为其生成账号密码（email为账号，密码默认为`123456`，可以在部署时配置）

> `Environment`：因为Api在开发测试的过程中会有很多环境，比如：QA, Stage, UAT, Prod等，这些环境会使用不同的host或header，使用环境变量就可以很方便的配置这些动态的设置，发送请求时选择想测试的环境即可。

`Schedule`: 任务计划，可以用它来每天或每周跑某一个`Collection`，并发送结果到相关邮箱，而且重要的是支持不同环境的数据对比，这十分有用，比如可以在release之前用`UAT VS PROD`做个对比，这样可以观察到新加的功能是否影响到了老的API，避免Side Impact。

部署成功后访问你设置的ip:port，首先需要注册，注册成功后登录系统，系统会给所有人分配一个默认的`Project`: `Me`和`Collection`: `Sample`，`Me`这个Project不能添加其他成员，专门给自己用的，自己做测试的时候可以把`Collection`和`Request`建在`Me`这个Project下。`Sample`这个Collection是个例子，演示了一些基本用法（使用时注意先选择右上角的环境）。

创建一个Request后，填上name, method, url等之后可以点击`Send`按钮来发送请求并等待请求的返回，返回的请求里包含了:
- `Content`: 也就是response主体
- `Headers`: 返回请求头
- `Cookies`: 返回的Cookies
- `Test`: `Request`的`Test`的校验结果
测试请求完成后点击`Save`按钮保存，当然，也可以`Save As`。

### Request:

`Request`可以通过tab bar右边的`+`创建，也可以通过`Collection`或`Folder`的菜单来创建，不过两个创建略有区别， tab bar上创建的因为没有`Collection`，也就不知道它所属的`Project`，因此也就没有环境可用，一般用于简单的测试，或者写完`Request`后先Save到`Collection`后再测试；通过`Collection`或`Folder`的菜单创建的`Request`就可以直接使用当前`Collection`的环境变量了。

`Request`的菜单里比较有用的一个是`Duplicate`，用于快速复制一个`Request`，另一个是`History`，这个可以查看当前`Request`的所有修改历史，以diff的形式展示，类似Code一样，方便协作维护。

`Request`可以拖拽到其他`Collection`或`Folder`。

### Cookie

有的Api不是公共开放的，需要登录Api获取`cookie`后才能使用其他Api，Hitchhiker里只需要先请求Login的请求，请求得到的`cookie`会保存在内存里，请求同一`Collection`或`host`的Api时，会使用这个`cookie`发送请求。

`cookie`的生命周期在浏览器里只在内存中，刷新或关闭，`cookie`就释放了，下次再访问时需要重新Login。
另外`cookie`还存在服务端的`Schedule`中， 这时它的生命周期就是整个`Schedule`, `Schedule`完成了，`cookie`也就释放了。

### 变量
