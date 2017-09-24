# <img src='https://raw.githubusercontent.com/brookshi/Hitchhiker/master/client/public/hitchhiker-title-dark.png' height='20'/>

Hitchhiker Api is a Restful Api integrated testing tool. You can deploy it in your local server. It make easier to manage Api with your team.

[中文 Read Me](README_cn.md)

Go to [http://www.hitchhiker-api.com](http://www.hitchhiker-api.com) for test，use `try without login`.

[Change log](change_log.md)

## Feature
* Api collaboration development with team
* Api history
* Multiple environments and Runtime variables support, easy to handle api dependence
* Request parameterization, include ManytoMany and OnetoOne, now you can use a request to handle multple situation like various query string, body
* Schedule and run batch
* Make a comparison for Api response between two different environments (eg: stage vs product)
* Support Handling response before comparing
* Easy to deploy (support docker, windows, linux), keep data in your control, never lose data
* All changed will be auto saved in local cache even if refresh page
* Support importing Postman v1 collections
* Performance test (progressing)
* Api Document (in future)

## Display

<img src='https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/collection.png' width='800'/>

[go for more](https://github.com/brookshi/images/tree/master/Hitchhiker)

## Deploy

Recommend use docker，it's easy and quickly，refer to [deploy with docker](doc/howtoinstall-docker-en.md)

Or you can deploy base on source code without docker, it's easy too.

linux: [deploy to linux](doc/howtoinstall-linux-en.md)

windows: [deploy to win](doc/howtoinstall-win-en.md)

## How to use

refer to [How to use](doc/howtouse-en.md)

## Browser

Only test in Chrome(Recommend) and Firefox, Don't have any plan to support the others.

## Licence

GPL-2.0 + Commercial use prohibited 