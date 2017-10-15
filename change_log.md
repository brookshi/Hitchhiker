# 0.2 2017-10-15
![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/stresstest.gif)

## Features:
* support Stress Test.

* Support change port while using source code to deploy.

# Bugs:
* Schedule run empty collection exception.

## Features:
* 支持压力测试

* 支持在源码部署时改端口

# Bugs:
* 修正Schedule跑空Collection时的异常

# 0.1.3 2017-09-24

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/parameters.gif)

## Features:
* request parameterization, include ManytoMany and OnetoOne, now you can use a request to handle multple situation like various query string, body.

* handle data by using $export$(data) for schedule comparing

* #13 send request with common header like 'accept' etc.. which is defined in appconfig.json

## Bugs:
* handle undefined value of test

* should not include cookie header if local cookie is empty

* origin request will miss headers after Save As request 

## Features:
* 参数化请求，可以使用随机组合的`ManytoMany`或者一对一组合的`OnetoOne`。 请求通常有很多参数，比如query string, body等，这些参数可能会有不止一个值，每个都要覆盖的话需要写很多request，比如一个request有三个可变的参数，每个参数又有3个值，随机组合下来会有`3*3*3=27个request`，这很麻烦，其实它们之前只是一点不同，现在可以使用参数来帮你做这个事，只需要把可变的参数写在parameter里面，系统会自动构建出request。

* 做schedule对比数据前可以先处理返回的response，再用处理后的数据进行比对，在test里使用 $export$(data) 来导出需要比对的数据。

* #13 请求的默认headers，这些header可以在根目录下的appconfig.json里配置，默认定义的是这些：
``` json
"defaultHeaders": [
    "Accept:*/*",
    "User-Agent:Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
    "Cache-Control:no-cache"
]
```

## Bugs:
* 没有处理test返回undefined的情况，改为返回失败

* 如果request不包含cookie且本地也没有cookie时发了空的cookie header，改为不发cookie header

* Save As request时原request会受到影响

# 0.1.2 2017-09-09

## Features:
* could clear local cache

* request's headers auto complete

* favorite request's headers

* global function of tests

* adjust ui style

## Features:
* 添加清除本地Cache功能

* request的header提示及自动完成

* 可以收藏常用的request header，方便下次使用

* 可以在Project里定义tests的全局函数，方便其下的Request直接使用

* 略微调整UI

# 0.1.1 2017-08-26

## Features:
* Request history

* Localhost mapping

* Create request by click menu item of Collection/Folder

* Request match/unmatch in Schedule

* Add folder name for Schedule result

* Try without login

## Bugs:
* Miss Headers sometimes after duplicating Request

* Schedule edit dialog should only display environments of selected Collection

* Run empty schedule error

* Folder can't expand if filter project

## Features:
* Request历史记录

* 成员可以添加Localhost映射

* 在Collection/Folder的菜单里创建Request

* Schedule可以选择是否要对某个Request做match

* Schedule的结果在Request前面加上Folder

* 免登录试用

## Bugs:
* 复制Request后源Request的headers有时会丢失

* Schedule编辑对话框应该只能选择当前Collection的环境

* 跑空Schedule会出错

* 选择了Project的话Folder不能展开


# 0.1.0 2017-07-24