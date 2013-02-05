import urllib2
from bs4 import BeautifulSoup
import sys

try:
	cache_path = sys.argv[1]
except IndexError:
	cache_path = "../static/cache/"

try:
	urlhandle = urllib2.urlopen('http://www.shc.edu/page/how-apply-undergraduate-program')
except urllib2.URLError:
	raise

page = urlhandle.read()
soup = BeautifulSoup(page)

getters = [{'name': 'remote_menu.main.inner', 'selector': '.primary-menu-inner .menu li'},
			{'name': 'remote_menu.secondary.admiss.how_to_apply', 'selector': '.menu-name-menu-main-ug'},
			{'name': 'remote_menu.services', 'selector': '.menu-name-secondary-links .menu'},
			{'name': 'remote_menu.social', 'selector': '#block-menu-menu-social-links .menu'}]

for getter in getters:
	name, selector = getter.values()
	content = soup.select(selector)
	filename = cache_path + name + ".html"
	fh = open(filename, "w")
	for item in content:
		fh.write(str(item))
	fh.close()
