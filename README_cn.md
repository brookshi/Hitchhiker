# <img src='https://raw.githubusercontent.com/brookshi/Hitchhiker/master/client/public/hitchhiker-title-dark.png' height='20'/>

Hitchhiker Api 是一款 Restful Api 集成测试工具，你可以在轻松部署到本地，和你的team成员一起管理Api。

[English Read Me](README_en.md)

## 功能

* Team协作开发Api
* Api历史修改记录及diff
* 支持多环境变量及collection级别变量
* 支持Schedule及批量run
* 不同环境下的请求数据对比 (eg: stage vs product)
* 支持导入Postman v1 collections
* 易部署 (支持 docker, windows, linux), 数据都存在自己这里，不会丢失
* 会记往任何修改，不用怕没保存时session失效或系统重启
* 性能测试 (开发中...)
* Api文档 (计划中...)

## 展示

<img src='https://github.com/brookshi/Hitchhiker/raw/master/doc/images/collection.png' width='200'/>

[go for more](https://github.com/brookshi/Hitchhiker/tree/master/doc/images)

## 部署

首推使用 docker 部署，简单快捷，具体操作参考[deploy with docker](doc/howtoinstall-docker-cn.md)

如果没有docker环境也可以使用源码部署，也很简单

linux 请参考 [deploy to linux](doc/howtoinstall-linux-cn.md)

windows 请参考 [deploy to win](doc/howtoinstall-win-cn.md)

## 使用

[使用说明](doc/howtouse-cn.md)

## Licence

GPL-2.0 + Commercial use prohibited 