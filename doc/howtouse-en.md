It's more easier if you are familiar with Postman.

### Concept：

**`Request`**: include `name`, `url`, `method`, `headers`, `parameters`, `body`, `test`

> All the properties you should know except `parameters` and `test`.

> `parameters` is used to build request with parameters, in general, a Api have some variables which have multiple values in query string or body, you must create lots of Request to cover all cases, for example: you have 3 variables in your api, every variable have 3 values, now you must create `3*3*3=27` requests, it's hard, They are basically the same，Now you can use `parameters` to handle this situation, just write the variables in `parameters`, Hitchhiker will auto create requests that you want.

> `parameters` have two option: `Many to Many` and `One to One`. let's, for example: there are two parameter `A` and `B`, `A` has two values: `1` and `2`，`B` has two values：`3` and `4`，you will have 4 request if select `Many to Many`： `13, 14, 23, 24`，and have 2 for `One to One`：`13, 24`。

> `Parameters` is a json object, you must write it using this format as below:
``` json
{
    "A": [1, 2],
    "B": [3, 4]
}
```

> `test` is used for response verification, you can use these variables as below:
> - `responseBody`: the response's body
> - `responseObj`：json object of this response's body (also you can use JSON.parse to get it)
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

> **`Members`**：you can invite people by using `Invite Members`, Enter emails and Hitchhiker will send mails to members. Member could click 'Accept invite' button in the mail to join Project, Hitchhiker will generate account and password for him (email for account and `123456` for default password).

> **`Environment`**：In general, there are several environments for coding or testing, eg：QA, Stage, UAT, Prod..., these environments use different domain or headers... Now it's easy to handle this by using `Environment`: set variables in `Environment` and use variables in `Request`, then send request by selecting different `Environment` to get the corresponding response.

**`Schedule`**: Use to run `Collection` daily or weekly，and send email include result to you or members. A important thing is it support comparing data between two environments, it's useful to run a `UAT VS PROD` before release to avoid side impact.

### First use

After deployed, enter ip:port in chrome/firefox to access Hitchhiker. First you should register and login, then you will get a default `Project`: `Me` and `Collection`: `Sample`，`Me` Project is used for test by yourself, this project can't invite other people. `Sample` Collection is a `Collection` sample, used to show the basic usage of `Collection` (**should select environment before send request**).

### Request:

You can create a `Request` by clicking `+` displayed on the right of tab bar, alternatively, you can use `Create request` in menu of `Collection` or `Folder`. The request created by clicking `+` doesn't under any `Project`, so there isn't any environment to use before `Save`/`Save as`, usually use it to do a simple test. The other one created under a `Collection`, so you can use environments of its `Collection` for it.

There are two useful menu item of `Request`, one is `Duplicate`，use to duplicate a existed `Request` to get a new request quickly, the other one is `History`，use to view diff history of this `Request` just like code.

You can drag and drop `Request` to other `Collection` or `Folder`.

### Api Cookie

Some Api need cookie to access server, in Hitchhiker, you need a request to get cookie at first, then cookies in response will be keep in memory, the other requests which under the same `Collection` or same host will auto use these cookies.

Cookie will be lost if refresh page in browser, you should request cookie again when you refresh page. In schedule, if your request need cookies, your need sort requests, drag `cookie-generated` request onto top.

### Variable

`Environment` is essentially a collection of variables. After set key-value variables in `Environment`, you can use it in your request's `url`, `header`, `body`, `test` with format `{{key}}`，the `{{key}}` will be replaced by `value`.

In some cases, Api may depend on the response of another Api. for this case Hitchhiker use another runtime variable defined in `Test` to handle it, you can set it with format：`$variables$.r_id = responseObj.recordId;`, that is, you can use the variables that defined in `$variables$` in your other requests. eg: `http://{{host}}/api/test?id={{r_id}}`. The life cycle of this variable is as same as `Cookie`, and it's global, all requests can use it.

### Localhost mapping

`Environment` always have a `DEV` environment with key: `host` value: `localhost` to debug，but Hitchhiker is a web app, so `localhost` is the server's ip, all members can't use localhost except server. Don't worry, you can set your ip in the localhost column of project's `Members`, then Hitchhiker will replace localhost with your ip while sending request, of course, your ip must be **accessible** for server.

### Schedule

Auto run `Collection` in `Schedule`, you need sort requests if there are dependencies between them, and you can select environment and comparing environment.
By the way, you can use `Run now` in menu to run it at any time, and will receive real-time messages of request (base on WebSocket).

### Compare response 

As above, you can compare responses for different environments in `Schedule`, but sometimes we need handle data before comparing, for example, we have a response which include a date field with value of now, it's to say, every response is different, you can't get PASS in `schedule`. But, you know, it makes no sense to compare a date with value of now, so we could remove it before comparing by using `$export$(data)` in `test`, handle response and then pass data to function `$export$`, Hitchhiker will use this data to compare in schedule.

### Stress Test

Hitchhiker include a distributed stress test system, must deploy [Hitchhiker-Node](https://github.com/brookshi/Hitchhiker-Node) to one or more PC before using it.
Create stress test task by including some `Request` of `Collection`, there are some options for stress test：
> - Repeat: repeat times
> - Concurrency: concurrency  
> - QPS: query per second for a worker, default is 0 (no limit)
> - Timeout: timeout second，default is 0 (worker nevel timeout)
> - Keeplive: set Keeplive for each request

Hitchhiker will display real-time state of stress test task, include workers, request progress, duration and failed status. There are three diagram:
1. Run progress, include done count and TPS
2. Duration of each request, include DNS, Connect, Request, Min, Max
3. request failed status, include No Response, Server Error(500), Test Failed.

**Stress Test Only support using ES5 in test**

### Sync data automatically

Auto sync Collectio data to all team members.
Default interval is 30s，you can change in appconfig.json (syncInterval)，or set env variable while installing (HITCHHIKER_SYNC_INTERVAL).