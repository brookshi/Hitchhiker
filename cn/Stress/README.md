Hitchhiker 现在有两种压力测试方式，一个基于Go的 [Hitchhiker-Node](https://github.com/brookshi/Hitchhiker-Node)， 另一个是基于Nodejs的，内置在Server里。

#### 为什么会有两种：

最开始Hitchhiker的脚本功能并不复杂，不支持js库，async/await，以及文件读取保存等，而Go很适合做这种高并发的程序，做了下调查后，使用otto做为js解释器，是可以运行当前的脚本逻辑的，所以选用了Go做压力测试的节点，早期是够用的。

后来Hitchhiker开始支持更多复杂的脚本功能，比如自定义js库这一项，因为npm里的很多js库都调用了Node的库，目前的Go以及otto满足不了这种需求，除非再加一个Node进程来执行脚本，这样过于复杂且不如直接使用Node来写，所以综合考虑后还是使用Nodejs重写了压力测试点。

#### 两种方法的优劣：

Go的高并发以及goroutine让写起这种压力程序时非常之轻松，性能也很有保障，缺点还是在于Hitchhiker的脚本是js，所以Go执行起来比较费劲，也因此Go的程序不支持Hitchiker脚本的高级特性。

Nodejs写这种压力测试程序就比较费劲，需要自己管理多进程，以及进程间通信，好在Hitchhiker Server也是基于Nodejs的，所以可以重用请求处理的逻辑，而且Api的压力测试本质上是高IO的，所以Nodejs的性能也很不错。不过Nodejs的程序目前还不支持分布式，稍后会加上去，主体功能已经完成。

稍微比较了下两者的性能，在单机上基本旗鼓相当。

#### 后续：

目前是以基于Nodejs的版本为默认的，Go的暂时会停止维护，除非Go有了基于Node的js解释器，那时再考虑移回来。

#### 用法

和Schedule一样，Stress Test运行的单位也是Collection，同样可以对Request进行排序，然后设置压力相关的参数，如并发数，请求次数等来模拟用户的真实场景。

下面来一步步创建一个Stress Test:

1. [创建一个Stress Test](Create_Stress.md).

2. [运行一个压力点](Node.md). Go的需要这么做，Nodejs的就不需要了。类型选择参考：[configuration](../installation/configuration.md)里的Stress Type

3. [运行](Run.md).