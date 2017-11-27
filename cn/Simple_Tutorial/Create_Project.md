#### 创建Project

首先，我们需要为API创建一个Project。

进入Project模块， 单击`create project` 按钮，然后会添加一个Project项，输入名字 `SampleAPI`:

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/create_project.png)

#### 邀请成员

项目创建完成后，我们可以邀请team的成员加入到这个Project里，来协作开发维护这个Project的API:

1. 单击 `Invite Members` 按钮.

2. 以 `;` 为分隔符在弹出的对话框里输入成员的email.

3. 单击OK按钮完成邀请.

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/project_invite.png)

现在刚刚邀请的成员会收到一封邀请邮件，他们可以单击邮件里的`Accept`按钮来接受邀请并加入到这个项目中，接受邀请后会再次收到系统发送的用户名和密码的邮件。

成员加入后就可以在成员列表中看到这些成员了。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/project_member.png)

只有Project的创建者可以移出成员，同样也只有创建者才能解散这个Project，解散后，项目下的所有成员都会失去这个项目的所有数据，包括Collection和Request。

注意到，在成员列表中有一列叫 `localhost`，所有成员都可以编辑它。这个参数的目的是用来在调试时让server知道localhost的指向，这样不是server的其他机器也能使用localhost来调试了。

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/simple_tutorial/project_localhost.png)