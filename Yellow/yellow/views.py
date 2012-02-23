from pyramid.view import view_config

from .models import (
    DBSession,
    )

@view_config(route_name='home', renderer='templates/mytemplate.pt')
def my_view(request):
    return {}
    one = DBSession.query(MyModel).filter(MyModel.name=='one').first()
    return {'one':one, 'project':'Yellow'}
