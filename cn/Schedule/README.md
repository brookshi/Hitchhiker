Collection 可以做为Request的集合一起来跑，而且跑的时候可以选择不同的环境，甚至同时选两个环境并对这两个环境返回的数据进行对比，除了环境外，你也可以让Request按照一定的顺序来跑，跑的过程中会校验Request里写的Test case是否正确并在最终结果里显示出来。

Hitchhiker 支持这种以Collection为单位的Schedule，你可以借此轻松实现API的自动化测试以及不同环境的数据比对。

按照下面步骤来运行一个Schedule:

1. [创建一个Schedule](Create_Schedule.md)

2. [运行Schedule](Run.md)
