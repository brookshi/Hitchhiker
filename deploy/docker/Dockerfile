FROM node:7.10
MAINTAINER brook.shi iwxiaot@gmail.com

RUN apt-get update

# code folder
RUN mkdir -p /usr/src
WORKDIR /usr/src
RUN git clone -b release https://github.com/brookshi/Hitchhiker.git
WORKDIR /usr/src/Hitchhiker

# npm install -g
RUN npm install -g pm2 yarn gulp-cli typescript@2.3.3 
RUN npm install gulp -D
RUN npm link typescript

# npm install
RUN npm install

RUN cd client && npm install

# gulp build
RUN gulp release --prod

WORKDIR /usr/src/Hitchhiker/build
# start mail
EXPOSE 8080
CMD ["pm2-docker", "index.js"]
