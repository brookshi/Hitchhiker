#### 为什么需要Parameters

通常，一个API会有好几个可变的参数存在于Url, Header或body里，为了让测试覆盖到所有case，往往需要创建出很多Request，这给维护带来了很大的麻烦。

Parameters就是为解决这个问题而出现的，看个例子：

在API中有3个变量，每个变量都有3个不同的值，这时你需要创建`3*3*3=27`个Requests来覆盖所有情况，这很麻烦。

其实这些请求大体上是相同的，所以使用Parameters就可以用一个请求来表达出所有这些情况，只需要把可变的部分提取出来，放到Parameters里面，Hitchhiker会自动帮你生成你想要的这些Request。

#### Parameters的组合方式

Parameters 有两种参数组合方式：`Many to Many` and `One to One`。

举个例子，现在有两个参数 `A` and `B`:
`A` 有2个值： `1` and `2`.
`B` 也有2个值：`3` and `4`.

选`Many to Many`就会产生4个Request： `13, 14, 23, 24`:

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/param_many.png)

`One to One`的话就只有2个：`13, 24`:

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/param_one.png)

Parameters 本质上是一个JSON格式的对象，你需要以下面这种格式来定义它：
``` json
{
    "A": [1, 2],
    "B": [3, 4]
}
```

#### 使用Parameters

继续前面的例子，修改Request `Sample Request` 来使用Parameters.

1. 转到Collection模块，选择 `Sample Request`，选择Request的Body tab，现在的Body是 `{ "Desc": "It's a sample" }`.

2. 把Body改为 `{ "Desc": "{{param}}" }`.

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/param_body.png)

3. 选择Request的Parameters tab。

4. 输入Parameters: `{ "param": [ "Test A", "Test B" ] }`。

5. 单击Save保存。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/param_save.png)

可以看到Hitchhiker根据这2个参数自动帮你生成了2个请求。

单击Send按钮可以同时请求这些Request，也可以选择其中一个来请求。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/param_send_all.png)

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/param_send_one.png)