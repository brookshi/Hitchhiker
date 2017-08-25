It's more easier if you familiar with Postman.

### Concept：

**`Request`**: include `name`, `url`, `method`, `headers`, `body`, `test`

> All the property you should know except `test`, `test` is used for response verification, you can use these variables as below:
> - `responseBody`: the response's body
> - `responseObj`：json object of this response's body (also you can use JSON.parse to get the it)
> - `responseHeaders`: response's headers
> - `responseTime`: request elapse time (ms)
> - `responseCode.code`: response status
> - `responseCode.name`: response message
> you can write javascript in `test` to verify response data by using these variables (support ES6)，eg：
> ```javascript
> tests["request success"] = responseObj && responseObj.success; 
> tests["response time is less than 200ms"] = responseTime < 200;
> ```

**`Response`**: now you have a `Request` include name, method, url..., then click the `Send` button to get a response
> The response include:
> - `Content`: response's body
> - `Headers`: response's headers
> - `Cookies`: cookies
> - `Test`: the results of your test case written in `Test`

**`Collection`**: collection of requests，you can create `Collection` under `Project` and create `Folder/Request` under `Collection`, `Collection` is the unit when you run schedule.

**`Project`**: use `Project` to work with your team，two things here: `Team Members` and `Environment`: 

> **`Members`**：you can invite people by using `Invite Members`, Enter emails and Hitchhiker will send mails to members. Member could click 'Accept invite' button in the mail to join Project, Hitchhiker will generate account and password for him (email for account and `123456` for default password.

> **`Environment`**：In general, there are several environments for coding or testing, eg：QA, Stage, UAT, Prod..., these environments use different domain or headers... Now it's easy to handle this by using `Environment`: set variables in `Environment` and use variables in `Request`, then send request by selecting different `Environment` to get the corresponding response.

**`Schedule`**: Use to run `Collection` daily or weekly，and send email include result to you or members. A important thing is it support comparing data between two environments, it's useful to run a `UAT VS PROD` before release to avoid side impact.

### First use

After deployed, enter ip:port in chrome/firefox to access Hitchhiker. First you should register and login, then you will get a default `Project`: `Me` and `Collection`: `Sample`，`Me` Project is used for test by yourself, this project can't invite other people. `Sample` Collection is a `Collection` sample, used to show the basic usage of `Collection` (**should select environment before send request**).

### Request:

You can create a `Request` by clicking `+` displayed on the left of tab bar, alternatively, you can use `Create request` menu of `Collection` or `Folder`. The request created on tab bar doesn't under any `Project`, so there isn't any environment to use before `Save`/`Save as`, usually use it to do a simple test. The other one created under a `Collection`, so you can use environments of its `Collection` for it.

There are two useful menu item of `Request`, one is `Duplicate`，use to duplicate a existed `Request` to get a new request quickly, the other one is `History`，use to view diff history of this `Request` like code.

You can drag and drop `Request` other `Collection` or `Folder`.

### Cookie

Some Api need cookie to access server, in Hitchhiker, you need request cookie at first, then cookies in response will be keep in memory, the other requests which under the same `Collection` or same host will auto use these cookies.

Cookie will be lost if refresh page in browser, you should request cookie again when you refresh page. So if your request need cookies, in schedule, your need sort requests, drag `cookie-generated` request onto top.

### Variable

`Environment` is essentially a collection of `Variable` 本质是就是一组变量的集合，变量在`Environment`里定义好后就可以在`Request`的`url`, `header`, `body`, `test`里使用，使用方法是用`{{}}`括起来，比如：`{{host}}`，这个`host`就是`Environment`里定义的变量`key`，在请求发送前系统会把`{{key}}`转换成对应的`value`。

有时我们发送的请求是有依赖的，比如依赖前一个请求的返回数据，这时可以用到另一种变量，这个变量是在`test`里定义的，定义格式：`$variables$.r_id = responseObj.recordId;`，也就是把变量定义在`$variables$`下面，这样`r_id`变量就可以给其他请求用了，比如：`http://{{host}}/api/test?id={{r_id}}`。这种变量的生命周期和`Cookie`一样，且是全局的，因此可能会带来一些混乱，解决办法是用好的命名方式隔离开。

### Localhost mapping

一般`Environment`会设置一个`DEV`环境指向`localhost`的，大家都可以用，但由于这个系统是Web的，所以请求时`localhost`指向的服务器，也就是部署的那台机器，这样调试起来会不方便，所以在`Project`的`Members`里有个`localhost mapping`，非服务器的`Member`可以修改自己的`localhost`为本机的`ip`，这样发送请求时系统会自动把`localhost`改成对应的`ip`，当然你的`ip`需要是对服务器可访问的。

### Schedule

`Schedule`可以选择要跑的`Collection`，`Collection`里的`Request`是否有依赖，有依赖的话需要按顺序跑，没依赖是并行跑的，会比较快；然后选择在哪个环境下跑，以及是否需要与另一个环境做数据对比，对比时因为有时不希望所有数据都做对比，比如请求一个token，结果肯定不一样，对比也没意义，这时可以`unmatch`那个request。

`Schedule`除了可以定时跑外还可以用菜单里的`Run now`，这是随时可以跑的，也可以实时看到跑的过程 (基于WebSocket)。

