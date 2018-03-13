Hitchhiker setting refer to: [Configuration](configuration.md), environment variable could be set in pm2.json

### IMPORTANT：If upgrade, please keep your pm2.json which keep all settings of hitchhiker in root folder.

```json
{
    "apps": [{
        "name": "hitchhiker",
        "script": "./build/index.js",
        "watch": false,
        "env": {
            "HITCHHIKER_APP_HOST": "myhost"
            # Set environment variable here
        }
    }]
}
```

#### Deploy step by step

Dependence: nodejs 7.60+, recommend use LTS (8.9) and `mysql 5.7+` with json column support;

> mysql, create db: `hitchhiker-prod` (or another name)，change mysql variable `max_allowed_packet=200M`
> create DB: CREATE DATABASE IF NOT EXISTS \`hitchhiker-prod\` default charset utf8 COLLATE utf8_general_ci;
> change variable: add `max_allowed_packet=200M` under [mysqld] section in /my.conf file, refer to：[change max_allowed_packet](https://stackoverflow.com/questions/8062496/how-to-change-max-allowed-packet-size)

1. Download app package from [https://github.com/brookshi/Hitchhiker/releases/download/v0.10/Hitchhiker.zip](https://github.com/brookshi/Hitchhiker/releases/download/v0.10/Hitchhiker.zip);

2. Unzip and run command `node setup.js`(windows), `sudo node setup.js`(linux) in `build` folder;

3. Open `http://localhost:9527/setup.html` in browser;

4. Enter host,port,db,setting etc.. step by step;

5. Submit;

![](https://raw.githubusercontent.com/brookshi/images/master/Hitchhiker/setup.png)