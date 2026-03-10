# SECURITY FLAW: Missing USER directive — container runs as root
# SECURITY FLAW: Missing HEALTHCHECK — container failures go undetected
#
# This Dockerfile demonstrates common OpenPanel extension issues
# that HostingLint should detect:
#   - openpanel-dockerfile (missing USER)
#   - openpanel-dockerfile (missing HEALTHCHECK)

FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    php-fpm \
    && rm -rf /var/lib/apt/lists/*

COPY config/ /etc/nginx/conf.d/
COPY src/ /var/www/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
