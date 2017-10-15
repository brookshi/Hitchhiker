用过Postman的话应该非常容易入手。

### 概念：

**`Request`**: 一个Api请求，包括`name`, `url`, `method`, `headers`, `parameters`, `body`, `test`

> 前面几个大家都应该很熟悉，就不多说了，重点说下`parameters`和`test`。

> `parameters`是用来构建参数化请求的，请求通常有很多参数，比如query string, body等，这些参数可能会有不止一个值，每个都要覆盖的话需要写很多request，比如一个request有三个可变的参数，每个参数又有3个值，随机组合下来会有`3*3*3=27个request`，这很麻烦，其实它们之前只是一点不同，现在可以使用参数来帮你做这个事，只需要把可变的参数写在parameter里面，系统会自动构建出所有request。

> `parameters`有两种组合方式，一种是所有组合`Many to Many`，另一种是一对一组合`One to One`，举个简单例子，两个参数`A`和`B`, `A`有两个值: `1`和`2`，`B`也有两个值：`3`和`4`，`Many to Many`的结果会有4个： `13, 14, 23, 24`，而`One to One`的结果有2个：`13, 24`。

> `Parameters`的格式是一个json对象，对象的下一层是变量以及它的值：数组。看个例子：
``` json
{
    "A": [1, 2],
    "B": [3, 4]
}
```
> `test`是用来为请求回来的数据做校验的，内置变量有:
> - `responseBody`: 请求返回的字符串
> - `responseObj`：请求返回的json对象
> - `responseHeaders`: response返回头
> - `responseTime`: 请求到返回结果的时间间隔
> - `responseCode.code`: 请求状态码
> - `responseCode.name`: 请求状态名

> 在`test`里可以写javascript代码来对这些变量做校验(支持ES6)，比如：
> ```javascript
> tests["request success"] = responseObj && responseObj.success; 
> tests["response time is less than 200ms"] = responseTime < 200;
> ```

**`Response`**: 创建一个`Request`后，填上name, method, url等之后可以点击`Send`按钮来发送请求并等待请求的返回
> 返回的请求里包含了:
> - `Content`: 也就是response主体
> - `Headers`: 返回请求头
> - `Cookies`: 返回的Cookies
> - `Test`: `Request`的`Test`的校验结果

**`Collection`**: request的集合，也可以创建子目录（只支持一级），`Collection`也是在`Schedule`里批量跑`Request`的单位

**`Project`**: 项目是用来让Team成员一起管理`Collection`的，项目里面的属性有`Team Members`和`Environment`: 

> **`Members`**：也就是Team成员，可以使用email邀请成员，系统会自动发送邮件，成员收到邮件后点击`接受邀请`按钮即可加入项目，系统会自动为其生成账号密码（email为账号，密码默认为`123456`，可以在部署时配置默认密码）

> **`Environment`**：因为Api在开发测试的过程中会有很多环境，比如：QA, Stage, UAT, Prod等，这些环境会使用不同的host或header，使用环境变量就可以很方便的配置这些动态的设置，发送请求时选择想测试的环境即可。

**`Schedule`**: 任务计划，可以用它来每天或每周跑某一个`Collection`，并发送结果到相关邮箱，而且重要的是支持不同环境的数据对比，这十分有用，比如可以在release之前用`UAT VS PROD`做个对比，这样可以观察到新加的功能是否影响到了老的API，避免Side Impact。

### 初次使用

部署成功后访问你设置的ip:port，首先需要注册，注册成功后登录系统，系统会给所有人分配一个默认的`Project`: `Me`和`Collection`: `Sample`，`Me`这个Project不能添加其他成员，专门给自己用的，自己做测试的时候可以把`Collection`和`Request`建在`Me`这个Project下。`Sample`这个Collection是个例子，演示了一些基本用法（使用时注意先选择右上角的环境）。

### Request:

`Request`可以通过tab bar右边的`+`创建，也可以通过`Collection`或`Folder`的菜单里的`Create request`来创建，不过两个创建略有区别， tab bar上创建的因为没有`Collection`，也就不知道它所属的`Project`，因此也就没有环境可用，一般用于简单的测试，或者写完`Request`后先Save (或Save As) 到`Collection`后再测试；通过`Collection`或`Folder`的菜单创建的`Request`就可以直接使用当前`Collection`的环境变量了。

`Request`的菜单里比较有用的一个是`Duplicate`，用于快速复制一个`Request`，因为测试时很多时候只是小部分参数不一样，复制一份修改起来更快；另一个是`History`，这个可以查看当前`Request`的所有修改历史，以diff的形式展示，类似Code一样，方便协作维护。

`Request`可以拖拽到其他`Collection`或`Folder`。

### Api Cookie

有的Api不是公共开放的，需要用登录Api获取`cookie`后才能使用其他Api，Hitchhiker 里只需要先发送cookie的请求，请求得到的`cookie`会保存在内存里，再次请求同一`Collection`或`host`的Api时，会自动使用已有的`cookie`。

`cookie`的生命周期在浏览器里只在内存中，刷新或关闭，`cookie`就释放了，下次再访问时需要重新请求cookie。
另外`cookie`还存在服务端的`Schedule`中， 这时它的生命周期就是整个`Schedule`, `Schedule`完成了，`cookie`也就释放了。

### 变量

上面提到的`Environment`本质是就是一组变量的集合，变量在`Environment`里定义好后就可以在`Request`的`url`, `header`, `body`, `test`里使用，使用方法是用`{{}}`括起来，比如：`{{host}}`，这个`host`就是`Environment`里定义的变量`key`，在请求发送前系统会把`{{key}}`转换成对应的`value`。

有时我们发送的请求是有依赖的，比如依赖前一个请求的返回数据，这时可以用到另一种运行时变量，这个变量是在`test`里定义的，定义格式：`$variables$.r_id = responseObj.recordId;`，也就是把变量定义在`$variables$`下面，这样`r_id`变量就可以给其他请求用了，比如：`http://{{host}}/api/test?id={{r_id}}`。这种变量的生命周期和`Cookie`一样，且是全局的，因此可能会带来一些混乱，解决办法是用好的命名方式隔离开。

### Localhost mapping

一般`Environment`会设置一个`DEV`环境，配置`host`指向`localhost`，大家都可以用，但由于这个系统是Web的，所以请求时`localhost`指向的是服务器，也就是部署的那台机器，这样调试起来会不方便，所以在`Project`的`Members`里有个`localhost mapping`，非服务器的`Member`可以修改自己的`localhost`为本机的`ip`，这样发送请求时系统会自动把`localhost`改成对应的`ip`，当然你的`ip`需要是对服务器可访问的。

### Schedule

`Schedule`可以选择要跑的`Collection`，`Collection`里的`Request`是否有依赖，有依赖的话需要按顺序跑，没依赖是并行跑的，会比较快；然后选择在哪个环境下跑，以及是否需要与另一个环境做数据对比，对比时因为有时不希望所有数据都做对比，比如请求一个token，结果肯定不一样，对比也没意义，这时可以`unmatch`那个request。

`Schedule`除了可以定时跑外还可以用菜单里的`Run now`，这是随时可以跑的，也可以实时看到跑的过程 (基于WebSocket)。

### 数据对比

上面提到数据对比是发生在`Schedule`里的，经常会有需求在数据对比前对数据进行一定的处理，考虑一种情况，返回的response里带有一个当前时间，也就表示每次返回的数据都是不同的，因为时间肯定不一样，这样就影响了对比结果，因为这个时间没什么对比意义，所以我们需要在对比前把它去掉，这时可以在`test`用`$export$(data)`的方式导出想比对的数据。（data就是处理后的数据）

### 压力测试

这是一个基于Golang的分布式压力节点，单独的一个项目：[Hitchhiker-Node](https://github.com/brookshi/Hitchhiker-Node)。得益于Golang的交叉编译，轻松跨平台生成文件，所以只有一个可执行文件和一个配置文件，不没有环境依赖，直接执行。

使用时在[release页面](https://github.com/brookshi/Hitchhiker-Node/releases/tag/v0.1)先选择对应平台的zip文件下载下来，解压后会有两个文件，一个可执行文件和一个配置文件config.json，打开配置文件，把`Address`的值从localhost改为部署Hitchhiker机器的ip，然后再执行Hitchhiker-Node文件，这样就弄好了一个压力点，如果想压出很大的请求就可以考虑部署到多台机器上，一般情况下直接部署到Hitchhiker同一台机器就可以了。

压力测试用的也是`Collection`的`Request`，可以选择性的挑出合适的`Request`用来做Case，压力测试的参数有：
> - Repeat: 运行整套请求的次数
> - Concurrency: 并发个数
> - QPS: 1秒内限制单个节点请求的个数，默认为0，即没有限制
> - Timeout: 超时时间设置，单位为秒，默认为0，即没有超时设置
> - Keeplive: 设置请求是否使用Keeplive

运行压力测试任务时会实时显示运行状态，包括节点的状态（闪烁表示正在工作），当前任务及任务的数量，下方有三个图表，分别表示 
1. 当前的运行进度，包括完成的数量及TPS
2. 各个`Request`的请求消耗时间，包括 DNS, Connect, Request, Min, Max 这五个
3. 请求失败的状态，包括 No Response, Server Error(500), Test失败 这三种情况

**压力测试只支持在test中使用ES5语法**