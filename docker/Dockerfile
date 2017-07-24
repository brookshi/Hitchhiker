FROM node:7.10
MAINTAINER brook.shi iwxiaot@gmail.com

RUN apt-get update

# code folder
WORKDIR /user_data/1665511877786131/GIT_HUB/iwxiaot-hitchhiker

# npm install -g
RUN npm install -g pm2 yarn gulp-cli typescript@2.3.3 
RUN npm install gulp -D

# npm install
RUN npm install
WORKDIR /user_data/1665511877786131/GIT_HUB/iwxiaot-hitchhiker/client
RUN npm install
WORKDIR /user_data/1665511877786131/GIT_HUB/iwxiaot-hitchhiker

# gulp build
RUN gulp release --host localhost --port 8080

WORKDIR /user_data/1665511877786131/GIT_HUB/iwxiaot-hitchhiker/build
# start mail
EXPOSE 8080
CMD ["pm2-docker", "index.js"]
