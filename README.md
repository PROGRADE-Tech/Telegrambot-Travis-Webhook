# Tarchivebot-Travis-Webhook
A small webhook service to notify a telegram chat of travis changes

# Setup
This webhook is intended to be run as a docker container behind nginx.
Other ways of running this webhook are untested and may not work

1. Clone the repository to a directory of your choice with `git clone https://github.com/PROGRADE-Tech/Tarchivebot-Travis-Webhook.git`

2. Install all dependancies with `npm install`

3. Copy the example config file and edit it<br>
`cp example.config.json config.json`<br>
`vim config.json`<br>
Values:<br>
`botToken` is your Telegram bot's authentication token.<br>
`chatId` is the chatId of the Telegram chat you want the bot to post to.<br>
`path` is the path you want your webhook to be exposed on (this is not the full url but only the part after your domain).

4. Build the docker container with`docker build -t PROGRADE-Tech/Tarchivebot-Travis-Webhook .`
5. Then run it with `docker run -d --name travis-webhook -p 3000:3000 PROGRADE-Tech/Tarchivebot-Travis-Webhook`. You can change the name and port as you see fit.

6. Set up nginx to reverse proxy to your container, this may look a bit like this:
```
server {
        listen 80;
        listen [::]:80;

        server_name travis.example.com;
        rewrite ^ https://travis.example.com$request_uri? permanent;    # force redirect http to https
}
server {
        listen 443 http2 ssl;
        listen [::]:443 http2 ssl;

        ssl on;
        ssl_certificate /etc/letsencrypt/live/travis.example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/travis.example.com/privkey.pem;

        server_name travis.example.com;

        location / {
                proxy_pass         http://172.17.0.1:3000; # you can get this IP by running the docker inspect command on the container
                proxy_redirect     off;
                proxy_set_header   Host $host;
                proxy_set_header   X-Real-IP $remote_addr;
                proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header   X-Forwarded-Host $server_name;
        }
}
```
7. Congratulations, your webhook should now be completely functional. Please contact @Hoi15A or open an Issue if you have problems or have found a bug.
