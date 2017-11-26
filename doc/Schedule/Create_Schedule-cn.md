首先进入Schedule模块, 单击 `create schedule` 按钮来创建一个schedule.

这时会弹出一个创建对话框，有以下参数：

**Name**: schedule的名字

**Collection**: 选择你想跑的Collection

**Sort request**: 按顺序来跑Collection里的请求，当这个选项勾上的话，下方会出现一个请求列表，你可以拖动它们来排序

**Period**: 任务跑的时间，可以设置为每天跑，或者每小时，甚至每分钟都可以

**Environment**: 选择Collection要跑的环境

**Compare**: 勾上这个选项会出现一个对比环境，然后跑的时候就会分别为每个环境跑一次，最后作数据对比，当然，有些请求可能我们不想让它们进行比对，比如cookie，这类的数据比对没有意义，所以在上面的请求列表中有个开关叫`match`，关掉时就不会对比这个请求的数据

**Notification**: 发送跑完的结果到邮箱里，可以自定义。 

单击OK按钮完成创建。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/schedule/schedule_create.png)

