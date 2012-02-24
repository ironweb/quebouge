from pyramid.config import Configurator
from sqlalchemy import engine_from_config

from .models import DBSession

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    config = Configurator(settings=settings)
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/')
    config.add_route('activities', '/activities')
    config.add_route('minify_js', '/min/js/{hash}')
    config.add_route('minify_css', '/min/css/{hash}')
    config.scan('yellow.views')
    return config.make_wsgi_app()

