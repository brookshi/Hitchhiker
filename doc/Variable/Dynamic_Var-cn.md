运行时变量是在脚本里动态定义出来的，通常用于为url生成hash签名或者保存一个请求的结果，然后在另一个请求中使用。

运行时变量可以在这些脚本中定义：`Global Function`, `Common Pre Request Script`, `Pre Request Script` 以及 `Test`.

使用如下API：

```js
hitchhiker.setEnvVariable('rt_var', 'test');  // 定义一个运行时变量 key: `rt_var`, value: `test`
const value = hitchhiker.getEnvVariable('rt_var'); // 获取变量的 value (`test`)
```

一个典型的场景：

有4个APIs: `create`, `select`, `update`, `delete`.
`create` API用于创建一项并返回id。
其他3个API依赖于这个id来做测试，这时可以把id写到运行时变量中，然后在其他3个API中获取这个id即可。

