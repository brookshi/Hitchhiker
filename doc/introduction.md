# <img src='https://raw.githubusercontent.com/brookshi/Hitchhiker/master/client/public/hitchhiker-title-dark.png' height='20'/>

Hitchhiker Api is a Restful Api integrated testing tool that support Schedule, Response comparsion, Stress Test, support upload js file to hook request, easy to deploy it in your local server. It make easier to manage Api with your team.

Go to [http://www.hitchhiker-api.com](http://www.hitchhiker-api.com) for test，use `try without login`. (Demo doesn't support stress test)


## Feature
* Api collaboration development with team
* Api history
* Multiple environments and Runtime variables support, easy to handle api dependence
* powerful script, support requiring any js lib which upload to project, read excel, cryptographic, no can't do
* Request parameterization, include ManytoMany and OnetoOne, now you can use a request to handle multple situation like various query string, body
* Schedule and run batch
* Make a comparison for Api response between two different environments (eg: stage vs product)
* Support Handling response before comparing
* Easy to deploy (support docker, windows, linux), keep data in your control, never lose data
* All changed will be auto saved in local cache even if refresh page
* Support importing Postman v1 collections
* Distributed stress test
* sync collection data of team automatically
* Api Document (in future)


## Different with Postman

| | Hitchhiker | Postman 
---------|----------|---------
Collaboration | ✔, auto sync | Need Share，Pro support but not free
Script | ✔ Powerful，could upload js lib | ✔ only can use built-in lib
Schedule | ✔ | ✔, use Newman and Jenkins 
Response comparison | ✔ | ✘
Stress Test | ✔ | ✘ 
Param Req | ✔ | ✘ 
Document | ✘, powerful doc system in plan | ✔，weak 
Api Mock | ✘ | ✔
Detail | Need improve | Strong 
security | Strong，deploy in local | Weak, data will upload to server

## Display

<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/collection.png' width='800'/>
<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/pre_request_script.PNG' width='800'/>
<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/header.gif' width='800'/>
<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/history.png' width='800'/>
<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/parameters.gif' width='800'/>
<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/schedule.png' width='800'/>
<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/stresstest.gif' width='800'/>

## Licence

GPL-2.0 + Commercial use prohibited 
