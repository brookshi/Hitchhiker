变量在以下这些情况下会非常有用：

1. 请求处在多环境状态下。

2. 请求有很多动态的参数在url, header或body中。

3. 请求之前互相有依赖。

4. 需要在请求发送前改变请求本身。

变量总是一个键值对，在使用时的格式为: `{{key}}`，你可在以这些地方来使用变量：`Common Pre Request Script`, `Pre Request Script`, `Test`, `Url`, `Body` 以及 `Header`。

所有的 `{{key}}` 在请求发送前或后都会被替换成变量对应的值，请求及变量运行流程可以参考图：[请求流程图](../Script/README.md).

Hitchhiker 有3种类型的变量：

1. [环境变量](Env_Var.md)

2. [Parameter变量](Param_Var.md)

3. [运行时变量](Dynamic_Var.md)