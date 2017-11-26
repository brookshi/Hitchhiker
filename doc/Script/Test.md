Test script allows you write test case in it, you can verify the response is correctly.

Test script will be executed after the request is back, in Test script, you can get some build-in variable: 

``` javascript
`responseBody`: the response's body
`responseObj`：json object of this response's body
`responseHeaders`: response's headers
`responseTime`: request elapse time (ms)
`responseCode.code`: response status
`responseCode.name`: response message       
```

You can verify data like this:
```js
tests["value is correct"] = responseObj.value === 100;

tests["status code is 200"] = responseCode.code === 200;
```

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/script/test_result.png)

You also can save response as a file to server, then can load this file in another request.

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/script/script_test.png)