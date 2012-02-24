# -=- encoding: utf-8 -=-
from pyramid.view import view_config
from pyramid.response import Response
from pprint import pprint
import os
import hashlib

from yellow.minify import JsMinify, CssMinify

from .models import (
    DBSession,
    Activity,
    Category,
    )

@view_config(route_name='home', renderer='/home.mako')
def home(request):
    categories = DBSession.query(Category).all()
    
    return {'categories': [Category(id='', name=u'Toutes les catégories')] + categories,
            'js_mini': JsMinify(request),
            'css_mini': CssMinify(request)}


@view_config(route_name='activities', renderer='json')
def activities(request):
    results = Activity.query_from_params(request.params)
    return {'num': len(results),
            'elements': results}


@view_config(route_name='minify_js')
def minified_js(request):
    return JsMinify(request).render_to_response(request.matchdict['hash'])

@view_config(route_name='minify_css')
def minified_css(request):
    return CssMinify(request).render_to_response(request.matchdict['hash'])
