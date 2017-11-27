#### 创建Request

可以有两次方式来创建Request。

* 单击Collection的菜单项`Create reuqest`来创建，这也是推荐的方式，因为创建出来的Request已经保存下来，可以使用到Project下的环境变量。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/request_create_1.png)

* 单击tab右边的 `+` 按钮

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/request_create_2.png)

下面来一步一步创建一个可以使用的Request到`Sample Collection`下面：

1. 鼠标移到Collection `Sample Collection`上面的...按钮上

2. 点击弹出菜的 `Create request` 

3. 在右边的编辑栏里输入名字： `Sample Request`

4. 选择Http Method: POST.

5. 输入url: http://httpbin.org/post?env=qa.

6. 输入Header, Key: Content-type, Value: application/json.

7. 输入Body: { "Desc": "It's a sample" }.

8. 单击Save按钮来保存

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/request_create_3.png)

Request创建好了，单击Send按钮来测试下吧。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/request_res.png)

#### Request的修改历史记录

正如我们所说，Hitchhiker 是一个支持多人协作的API测试工具，有时我们希望知道一个Request是被谁在什么时间修改的，改了什么内容等，这时就可以使用Request历史记录功能。 

单击Request的菜单项 `history`，会弹出一个页面，里面以diff的方式展示了每次Request修改的具体信息。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/request_history.png)
