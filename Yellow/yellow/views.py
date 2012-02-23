from pyramid.view import view_config
from pprint import pprint

from .models import (
    DBSession,
    Activity,
    )

@view_config(route_name='home', renderer='templates/mytemplate.pt')
def my_view(request):
    return {}
    one = DBSession.query(MyModel).filter(MyModel.name=='one').first()
    return {'one':one, 'project':'Yellow'}


@view_config(route_name='activities', renderer='json')
def activities(request):
    query = Activity.query_from_params(request.params)
    results = query.all()
    pprint(results)
    return {}

