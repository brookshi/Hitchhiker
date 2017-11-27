Common Pre Request Script 是Collection级别的，在Collection的菜单里可以找到，可以用来对Collection下的Request做一些通用的事情。

一个典型的应用场景是Collection下面所有的Request的url都需要在发送前加一个动态hash值，如果每个Request都去写的话就显得很麻烦，而且维护起来也不方便，所以最好的办法就是把这些通用的事情放到Collection 级别来做。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/script/script_common_pre_script.png)

脚本API参考: [脚本API](API.md).