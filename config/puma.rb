threads 0,16
workers 1
#port 5000
environment "production"
#environment "development"
bind "unix:////Users/erwinkarim/novgolf/tmp/sockets/puma.sock"
preload_app!
