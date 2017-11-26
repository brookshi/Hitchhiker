进到Stress模块然后点击`create stress test` 按钮.

在弹出的对话框里填写参数：

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/stress/stress_create.png)

**Name**: stress test的名字.

**Collection**: 需要做压力测试的Collection.

**Requests**: 选择要跑的请求以及排序.

**Repeat**: 重复次数.

**Concurrency**: 并发数.

**QPS**: 每个压力点每秒请求数，默认为0，即没有限制.

**Timeout**: 请求的超时时间，单位为秒，默认为0，即没有限制.

**Keeplive**: 请求是否设置Keeplive.

**Environment**: 要跑的环境.

设置完成后单击OK按钮完成创建。