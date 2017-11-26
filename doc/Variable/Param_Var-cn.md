Parameters变量是在Request的Parameters tab下定义的。
它可以让你把多个Request合并成一个，减少维护成本。

例如, 有一个API: `http://httpbin.org/get?boy={{boy}}&girl={{girl}}`, 可以看到API里有2个参数。
现在在Parameters里面加上如下对象，表示每个参数各有3个不同的值：

```json
{
    "boy": ["tom", "jerry", "mike"],
    "girl": ["lucy", "lily", "cristina"]
}
```

结果，选`OneToOne`的话我们可以得到3个Request:
```
http://httpbin.org/get?boy=tom&girl=lucy
http://httpbin.org/get?boy=jerry&girl=lily
http://httpbin.org/get?boy=mike&girl=cristina
```
选`ManyToMany`的话就会有9个Request:
```
http://httpbin.org/get?boy=tom&girl=lucy
http://httpbin.org/get?boy=tom&girl=lily
http://httpbin.org/get?boy=tom&girl=cristina
http://httpbin.org/get?boy=jerry&girl=lucy
http://httpbin.org/get?boy=jerry&girl=lily
http://httpbin.org/get?boy=jerry&girl=cristina
http://httpbin.org/get?boy=mike&girl=lucy
http://httpbin.org/get?boy=mike&girl=lily
http://httpbin.org/get?boy=mike&girl=cristina
```

而所有的这个Request只存在一个Request里。

我们可以同时请求这些不同参数的Request，也可以选择其中一个来请求。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/parameters.gif)