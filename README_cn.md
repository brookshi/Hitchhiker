# <img src='https://raw.githubusercontent.com/brookshi/Hitchhiker/master/client/public/hitchhiker-title-dark.png' height='20'/>

Hitchhiker 是一款开源的 Restful Api 测试工具，支持Schedule, 数据对比，压力测试，支持上传脚本定制请求，可以轻松部署到本地，和你的team成员一起管理Api。

访问 [http://www.hitchhiker-api.com](http://www.hitchhiker-api.com) 测试，可以点击 `try without login`, 另外，为了免备案，服务器在海外的，所以速度上可能会有点慢，请谅解。(在线演示不支持压力测试)

[Document](https://brookshi.gitbooks.io/hitchhiker/doc/introduction.html)

[中文文档](http://doc.hitchhiker-api.com/cn/installation/)

[更新日志](http://doc.hitchhiker-api.com/cn/change_log.html)

## 功能

* Team协作开发Api
* Api历史修改记录及diff
* 支持多环境变量及运行时变量，可以处理Api依赖问题
* 超强脚本，支持require，可以上传JS包，读excel，加解密，没有做不到，只有想不到
* 参数化请求，把query/body里的变化点提取出来，构建出参数列表，极大减少request的数量
* 支持Schedule及批量run
* 不同环境下的请求数据对比 (eg: stage vs product)
* 支持在数据对比前对数据进行处理
* 易部署 (支持 docker, windows, linux), 数据都存在自己这里，不会上传及丢失
* 会记往任何修改，不用怕没保存时session失效或系统重启
* 支持导入Postman v1 collections
* 分布式压力测试
* 自动同步Team成员的Collection数据
* Api文档 (计划中...)


## 对比Postman

Func  | Hitchhiker | Postman 
---------|----------|---------
协作性 | ✔ | 通过Share，Pro收费 
脚本 | ✔ 强，可以上传脚本 | ✔ 一般，只能用内置的脚本库 
Schedule | ✔ | ✔ 需要借助Newman, Jenkins 
数据对比 | ✔ | ✘ 
压力测试 | ✔ | ✘ 
参数化请求 | ✔ | ✘ 
文档 | ✘ 模板化的文档在计划中 | ✔，固定格式 
Api Mock | ✘ | ✔ 
细节，稳定性 | 一般，待加强 | 强 
安全性 | 强，本地部署 | 弱，数据上传 

## 展示

<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/collection.png' width='800'/>
<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/pre_request_script.PNG' width='800'/>
<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/header.gif' width='800'/>
<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/history.png' width='800'/>
<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/parameters.gif' width='800'/>
<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/schedule.png' width='800'/>
<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/stresstest.gif' width='800'/>

## 浏览器

只在Chrome(推荐)和Firefox下测试过，其他的暂不考虑。
这个工具的用户应该是Developer或QA，没理由没有Chrome和Firefox中的一个。

## 微信群

<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/hitchhiker_wx.jpg' width='400'/>

## Licence

GPL-2.0 + 禁止商用 
