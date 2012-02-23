import os
import sys
import transaction
import time

from sqlalchemy import engine_from_config

from pyramid.paster import (
    get_appsettings,
    setup_logging,
    )

from ..models import (
    DBSession,
    Base,
    Activity,
    Occurence,
    Category,
    )
from geopy import geocoders


def usage(argv):
    cmd = os.path.basename(argv[0])
    print('usage: %s <config_uri>\n'
          '(example: "%s development.ini")' % (cmd, cmd)) 
    sys.exit(1)

def main(argv=sys.argv):
    if len(argv) != 2:
        usage(argv)
    config_uri = argv[1]
    setup_logging(config_uri)
    settings = get_appsettings(config_uri)
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    db = DBSession()

    with transaction.manager:
        from sqlalchemy.sql import select
        locations = list(db.execute(select([Activity.location]) \
                                       .group_by(Activity.location)))
        for loc in locations:
            address = loc.location
            if 'Boul Pie-XI,' in address:
                address = address.replace('Pie-XI,', 'Pie-XI Nord')
            print address
            geo = cache_geocode(address.encode('utf-8'))
            print geo[1]
        print "LEN", len(locations)

def cache_geocode(address):
    """Cache dans un fichier geocode.cache les requêtes pour éviter que ça
    jam chez Google.
    """
    import os
    import pickle
    if os.path.exists('geocode.cache'):
        cache = pickle.load(open('geocode.cache'))
    else:
        cache = {}

    if address in cache:
        return cache[address]
    
    geocode = geocoders.Google()
    res = geocode.geocode(address)
    time.sleep(0.5)
    cache[address] = res
    pickle.dump(cache, open('geocode.cache', 'w'))
    return res
    
