# use kapitalwise base image (having node and sumo collector)
FROM ashishkapitalwise/kw_services_docker_base_image
MAINTAINER Sajil Koroth<sajil@kapitalwise.com>
RUN apt-get update && \
    apt-get install -y git

RUN apt-get install -y runit
CMD export > /etc/envvars && /usr/sbin/runsvdir-start
RUN echo 'export > /etc/envvars' >> /root/.bashrc
RUN npm install -g npm@6.14.6
RUN npm install sails@1.5.4 -g
RUN npm install nodemon -g
RUN npm install grunt-cli -g

RUN npm install grunt -g
RUN mkdir /dashboard-afi

ADD . dashboard-afi
WORKDIR /dashboard-afi
COPY package.json /dashboard-afi
RUN npm install sails@1.5.4
RUN cd /dashboard-afi
RUN npm install
# Expose port
EXPOSE 1337
WORKDIR /dashboard-afi
# Use wrapper.sh always to start the container, Don't use custom scripts
# wrapper.sh wraps up both SailsJs and collector startup scripts
CMD ["./wrapper.sh"]
