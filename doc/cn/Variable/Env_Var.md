环境变量是在Project的Environment中定义的，通常环境变量用于维护不同环境下的host，header等。

举个例子：
我们的API有3个环境，分别是: QA, Stage, Product。每个环境都有自己的域名：

```
QA: http://api-qa.sample.com/
Stage: http://api-stg.sample.com/
Product: http://api.sample.com/
```

没有环境变量的话，我们需要为这些环境分别创建Request，这太麻烦了。

我们可以先创建出这些环境，比如QA环境，添加一个变量 key: `host`, value: `http://api-qa.sample.com/`。
复制后同样的方式做出Stage和Product环境。

现有，我们有3个环境了，可以在同一个请求里来使用它们。
创建一个请求，url: `{{host}}/get`，分别选择不同的环境来测试。

`{{host}}` 会在请求发送前替换成不同环境对应的值，比如选择QA, 请求的url会是`http://api-qa.sample.com/`, 选 Stage的话就是 `http://api-stg.sample.com/`。