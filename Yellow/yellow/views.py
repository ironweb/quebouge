# -=- encoding: utf-8 -=-
from pyramid.view import view_config
from pyramid.response import Response
from pyramid.renderers import render_to_response
from mako.template import Template
from pprint import pprint
import os
import hashlib

from yellow.minify import JsMinify, CssMinify, MobileJsMinify

from .models import (
    DBSession,
    Activity,
    Occurence,
    Category,
    )

@view_config(route_name='home')
def home(request):
    return render_layout(request)

@view_config(route_name='activity', renderer='json')
def activity(request):
    request_type = request.accept.best_match(['application/json',
                                              'text/html'])
    if request_type == 'application/json':
        data = Occurence.query_from_id(request.matchdict['id'],
                                       request.params.get('latlon'))
        return data
    else:
        return render_layout(request)

@view_config(route_name='activities', renderer='json')
def activities(request):
    results = Activity.query_from_params(request.params)
    return {'num': len(results),
            'elements': results}


@view_config(route_name='minify_js')
def minified_js(request):
    return JsMinify(request).render_to_response(request.matchdict['hash'])

@view_config(route_name='minify_mobile_js')
def minified_mobile_js(request):
    return MobileJsMinify(request).render_to_response(request.matchdict['hash'])

@view_config(route_name='minify_css')
def minified_css(request):
    return CssMinify(request).render_to_response(request.matchdict['hash'])

def render_layout(request):
    categories = DBSession.query(Category).all()
    first_categ = Category(id='', name=u'- Tous les loisirs à Québec -')
    context = {'categories': [first_categ] + \
                           sorted(categories, key=lambda x: x.name.lower()),
               'js_mini': JsMinify(request),
               'css_mini': CssMinify(request),
               'js_mobile_mini': MobileJsMinify(request)}

    return render_to_response('/home.mako',
                              context,
                              request=request)
