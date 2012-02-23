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
    Base.metadata.create_all(engine)

    categories = {}
    with transaction.manager:
        from tricateg import import_xml_data
        struct = import_xml_data()
        for checker in struct:
            categ = checker.categ
            if categ not in categories:
                cat_obj = Category(name=categ)
                categories[categ] = cat_obj
                DBSession.add(cat_obj)
            else:
                cat_obj = categories[categ]

            for db_node in checker.matches_nodes:
                new_act = Activity(title=db_node.description)
                new_act.category = cat_obj
                new_act.location = db_node.adresse
                DBSession.add(new_act)
                for occ in db_node.occurences:
                    new_occ = Occurence()
                    new_occ.activity = new_act
                    new_occ.dtstart = occ.start_datetime
                    new_occ.dtend = occ.start_datetime + db_node.duration
                    DBSession.add(new_occ)
