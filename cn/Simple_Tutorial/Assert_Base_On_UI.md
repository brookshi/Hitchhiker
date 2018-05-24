#### 基于UI的断言

断言可以帮忙测试更好的测出返回数据的正确性问题，一般来说通过脚本来创建断言会更灵活，但是对于QA来说，对脚本可能不太熟悉，或者说熟悉其他脚本但不熟悉js，写起来就不太容易了。

针对这种情况推出了基于UI的断言，只需要用鼠标点点，写写目标值就可以了。

里面也可以有一些稍复杂些的函数，比如custom，这个可以根据当前校验的对象来使用不同的函数，使用的是js语法，比如string类型的，可以使用contains, match之类，如果是数组，则可以使用find(v=>v==='a') != null之类。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/assert.PNG)

#### 如何创建

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/assert.gif)