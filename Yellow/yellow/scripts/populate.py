# -=- encoding: utf-8 -=-

import os
import sys
import transaction

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
    populator = DatabasePopulator(config_uri)

    populator.drop_and_create()


class DatabasePopulator(object):

    def __init__(self, config_uri):
        setup_logging(config_uri)
        settings = get_appsettings(config_uri)
        self.engine = engine_from_config(settings, 'sqlalchemy.')
        DBSession.configure(bind=self.engine)

    def drop_and_create(self):
        self.create_tables()
        self.populate_categories()
        self.populate_geocode()

    def drop_tables(self):
        # Can't drop table for some reason. Screw it
        Base.metadata.reflect(bind=self.engine)
        tables_to_keep = set(('spatial_ref_sys', 'geometry_columns'))
        for table in reversed(Base.metadata.sorted_tables):
            if not table in tables_to_keep:
                t = table.drop(bind=self.engine, checkfirst=True)
                if t: self.engine.execute(t)

    def create_tables(self):
        Base.metadata.create_all(self.engine)

    def populate_categories(self):
        categ_image = {}
        for line in open('../datasets/CATEGORY_IMAGES.txt'):
            desc_image = line.split(',')
            if len(desc_image) != 2:
                continue
            categ_image[desc_image[0]] = desg_image[1]

        categories = {}
        with transaction.manager:
            from tricateg import import_xml_data
            struct = import_xml_data()
            for checker in struct:
                categ = checker.categ
                if categ not in categories:
                    cat_obj = Category(name=categ)
                    categories[categ] = cat_obj
                    # Assign icon
                    if categ not in categ_image:
                        cat_obj.icon_name = categ_image['Divers']
                    else:
                        cat_obj.icon_name = categ_image[categ]
                    DBSession.add(cat_obj)
                else:
                    cat_obj = categories[categ]

                for db_node in checker.matches_nodes:
                    new_act = Activity(title=db_node.description)
                    new_act.category = cat_obj
                    new_act.location = db_node.adresse
                    new_act.location_info = db_node.location_info
                    new_act.price = db_node.tarif
                    new_act.price = db_node.tarif
                    DBSession.add(new_act)
                    for occ in db_node.occurences:
                        new_occ = Occurence()
                        new_occ.activity = new_act
                        new_occ.dtstart = occ.start_datetime
                        new_occ.dtend = occ.start_datetime + db_node.duration
                        DBSession.add(new_occ)

    def populate_geocode(self):
        db = DBSession()

        with transaction.manager:
            from sqlalchemy.sql import select
            locations = list(db.execute(select([Activity.location]) \
                                           .group_by(Activity.location)))
            for loc in locations:
                address = loc.location
                if 'Boul Pie-XI,' in address:
                    address = address.replace('Pie-XI,', 'Pie-XI Nord')
                elif u"4473, Rue Saint-Félix, Québec (QC) G1Y 3A6" in address:
                    address = u"4473, Rue Saint-Félix, Québec (QC) G1Y 3A8"
                print address
                geo = self.cache_geocode(address.encode('utf-8'))
                print geo[1]
                for act in db.query(Activity).filter_by(location=loc.location):
                    act.position = "POINT(%f %f)" % geo[1]
            print "LEN", len(locations)


    def cache_geocode(self, address):
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
