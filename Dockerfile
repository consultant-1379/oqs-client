FROM armdocker.seli.gic.ericsson.se/dockerhub-ericsson-remote/node:14.17.0-alpine

# 80 = HTTP
EXPOSE 80

# Set development environment variable
ENV NODE_ENV development

# Set display and chrome env variables for use in client tests
ENV DISPLAY=:99.0 \
    CHROME_BIN=/usr/bin/chromium-browser

# Set the working directory
WORKDIR /opt/mean.js

# Install required packages
RUN apk add --no-cache git chromium xvfb dbus xorg-server mesa-dri-swrast ttf-freefont --verbose

# Install the development packages
COPY package.json /opt/mean.js/package.json
RUN npm install \
  && npm link gulp@4.0.0 \
  && npm link webpack@4.27.1 \
  && npm link webpack-cli@3.1.2 \
  && npm link nodemon@1.18.9

# Copy Version for Sharing via Volume
COPY VERSION /opt/mean.js/version-info/VERSION

CMD ["./dev_start.sh"]
