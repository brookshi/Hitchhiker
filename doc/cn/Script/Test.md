你可以在Test脚本里做一些请求是否正确返回的校验工作。

Test脚本会在请求返回后开始执行，在Test里可以访问到一些关于请求返回的内置对象：

``` javascript
`responseBody`: 返回的主体，字符串
`responseObj`：返回的json对象
`responseHeaders`: 返回的headers
`responseTime`: 请求消耗的时间（毫秒）
`responseCode.code`: 请求响应的状态码
`responseCode.name`: 请求响应文本
```

你可以像下面的脚本一样做数据校验：

```js
tests["value is correct"] = responseObj.value === 100;

tests["status code is 200"] = responseCode.code === 200;
```

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/script/test_result.png)

还可以在脚本里把数据保存到文件，然后就可以在其他请求中使用这个文件。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/script/script_test.png)