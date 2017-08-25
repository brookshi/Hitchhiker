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

`Environment` is essentially a collection of variables. After set key-value variables in `Environment`, you can use it in your request's `url`, `header`, `body`, `test` with format `{{key}}`，the `key` will replaced by `value`.

In some cases, Api may depend on the response of another Api, for this case Hitchhiker use another Variable defined in `Test` to handle it, you can set it with format：`$variables$.r_id = responseObj.recordId;`, that is, you can use variable that defined in `$variables$`. eg: `http://{{host}}/api/test?id={{r_id}}`. The life cycle of this variable is as same as `Cookie`, and it's global, all requests can use it.

### Localhost mapping

`Environment` may have a `DEV` environment with key `localhost` to debug，but Hitchhiker is a web app, so `localhost` is server's ip, it's not to debug. Don't worry, you can set your ip in the localhost column of project's `Members`, then Hitchhiker will replace localhost with your ip when send request, of course, your ip must be Accessible for server.

### Schedule

Auto run `Collection` in `Schedule`, you need sort requests if there are dependencies between them, and you can select environment and comparing environment.
By the way, you can use `Run now` in menu to run it at any time, and will receive real-time messages of request (base on WebSocket).

