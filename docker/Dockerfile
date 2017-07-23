FROM node:7.10
MAINTAINER brook.shi iwxiaot@gmail.com

RUN apt-get update

# code folder
WORKDIR /user_data/1665511877786131/CODE/iwxiaot-hitchhiker

# npm install -g
RUN npm install -g pm2 gulp-cli typescript@2.3.3 
RUN npm install gulp -D

# npm install
RUN npm install

# gulp build
RUN gulp build

WORKDIR /user_data/1665511877786131/CODE/iwxiaot-hitchhiker/bin
# start mail
EXPOSE 82
CMD ["pm2-docker", "index.js"]
