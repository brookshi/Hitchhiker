压力点准备就绪，已经运行起来的话，现在就可以尝试跑下压力测试了。

把鼠标移到Stress Test item上，在弹出的菜单里点击 `Run Now`。

Hitchhiker 会显示压力测试实时状况，包括当前工作的压力点，压力测试的进度，TPS以及请求失败的状态。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/stress/stress_run.png)

可以看到有3个图表（从上到下）：

1. 压力测试的当前进度，包括压力集中在哪些请求上，已经完成的请求数，当前的TPS。

2. 每个请求消耗的时间，包括DNS, Connect, Request, Min, Max。

3. 请示失败的状态和个数，失败有3种：No Response, Server Error(500), Test Failed.

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/stresstest.gif)

压力请求也可以中断掉，因为可能在压力过程中服务端已经暴露出了问题，不需要再跑下去，这时可以停止当前压力测试。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/stress/stop.png)

