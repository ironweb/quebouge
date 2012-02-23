# -=- encoding: utf-8 -=-
from pyramid.view import view_config
from pprint import pprint

from .models import (
    DBSession,
    Activity,
    Category,
    )

@view_config(route_name='home', renderer='/home.mako')
def my_view(request):
    categories = DBSession.query(Category).all()
    return {'categories': [Category(name=u'Toutes les catégories')] + categories}


@view_config(route_name='activities', renderer='json')
def activities(request):
    results = Activity.query_from_params(request.params)
    return {'num': len(results),
            'elements': results}

