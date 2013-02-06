compile less and link to static files
ensure /media/page-partials exists in apache
set up cron to run command daily (change paths as needed!):
	15 2 * * * /usr/bin/python26 /home/wwwuser/webapps/sandbox/dynamic_checklist/lib/url-fetch.py /home/wwwuser/webapps/static/assets/page-partials
