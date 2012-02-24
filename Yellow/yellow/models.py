# -=- encoding: utf-8 -=-

from sqlalchemy import (
    Column,
    Integer,
    Float,
    Text,
    Unicode,
    UnicodeText,
    ForeignKey,
    DateTime,
    sql,
    )

from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.orm import (
    scoped_session,
    sessionmaker,
    relationship,
    joinedload
    )

from geoalchemy import (
    GeometryColumn,
    Point,
    GeometryDDL,
    )
from geoalchemy.functions import functions
from shapely import wkb


from zope.sqlalchemy import ZopeTransactionExtension

import datetime

DBSession = scoped_session(sessionmaker(extension=ZopeTransactionExtension()))
Base = declarative_base()

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True)
    name = Column(Unicode(255), unique=True)
    parent_id = Column(Integer, ForeignKey('categories.id'))
    parent = relationship("Category")
    icon_name = Column(Unicode(255))

class Arrondissement(Base):
    __tablename__ = "arrondissements"
    id = Column(Integer, primary_key=True)
    phone = Column(Unicode(35))
    name = Column(Unicode(255))

class Activity(Base):
    __tablename__= "activities"
    id = Column(Integer, primary_key=True)
    title = Column(Unicode(255))
    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship(Category)
    location = Column(Unicode(255))
    location_info = Column(Unicode(255))
    position = GeometryColumn(Point(2))
    price = Column(Float)
    arrondissement_id = Column(Integer, ForeignKey("arrondissements.id"))
    arrondissement = relationship(Arrondissement)

    # joinedload
    @staticmethod
    def query_from_params(params):
        """Requête principale de recherche pour avoir les activités et
        occurences.

        Params:
        
        ``latlon`` requis pour tous les calls (pour la distance).
        ``bb`` est le bounding box
        ``radius`` dans une unité inconnue à ce jour

        """
        if not params.get('latlon'):
            return ValueError("`latlon` parameter required")
        if 'bb' in params and 'radius' in params:
            raise ValueError('Invalid input : both `radius` and `bb` were submitted.')

        db = DBSession()
        latlon = lat_lon_to_point(params['latlon'])
        distance = functions.distance(Activity.position,
                                      latlon)
        joins = Occurence.__table__.join(Activity.__table__) \
                  .join(Category.__table__).join(Arrondissement.__table__)
        q = sql.select([Occurence.id, Occurence.dtstart,
                        Occurence.dtend,
                        Activity.title, Activity.location,
                        Activity.location_info, Activity.position,
                        Activity.price, distance,
                        Category.icon_name,
                        "categories.name as category_name",
                        "arrondissements.name as arrondissement_name",
                        "arrondissements.phone as arrondissement_phone",
                       ],
                       from_obj=joins)
        q = q.where(Occurence.activity_id == Activity.id) \
             .where(Activity.category_id == Category.id) \
             .where(Arrondissement.id == Activity.arrondissement_id)

        # By bounding-box
        if 'bb' in params:
            q = q.where(Activity.position.within(bb_to_polyon(params['bb'])))

        # By radius
        if 'radius' in params:
            q = q.where(Activity.position.within(functions.buffer(latlon,
                                                  float(params['radius']))))
        # Category
        if params.get('cat_id'):
            q = q.where(Activity.category_id == int(params['cat_id']))

        # Start datetime
        if 'start_dt' in params:
            dt_start = extract_date_time(params['start_dt'])
            dt_start_is_now = False
        else:
            dt_start = datetime.datetime.now()
            dt_start_is_now = True

        # End datetime
        if 'end_dt' in params:
            dt_end = extract_date_time(params['end_dt'])
        else:
            dt_end = dt_start + datetime.timedelta(5) # jours

        q = q.where(Occurence.dtend <= dt_end)

        # Get those before they end
        if dt_start_is_now:
            in_half_hour = dt_start + datetime.timedelta(0, 1800)
            res1 = db.execute(q.where(Occurence.dtstart < in_half_hour) \
                               .where(Occurence.dtend > dt_start) \
                               .order_by(Occurence.dtend.asc()))
        else:
            res1 = []

        # Get those before they start
        res2 = db.execute(q.where(Occurence.dtstart >= dt_start) \
                           .order_by(Occurence.dtstart) \
                           .limit(50))
                           

        ret1 = [Activity._row_result_to_dict(row, past=True) for row in res1]
        ret2 = [Activity._row_result_to_dict(row, past=False) for row in res2]
        return (ret1 + ret2) # maximum renvoyés

    @staticmethod
    def _row_result_to_dict(row, past):
        """Convertit une requête pour être passée via JSON à l'appli web.

        ``row`` est le résultat de la requête dans "query_from_params()".
        ``past`` indique si l'événement est passé par rapport à now()
        """
        point = wkb.loads(str(row.st_asbinary))
        delta = abs(row.dtend - row.dtstart)
        duration = delta.seconds + delta.days * 84600
        phone = row.arrondissement_phone
        nice_phone = "%s-%s-%s" % (phone[:3], phone[3:6], phone[6:])
        out = dict(occurence_id=row.id,
                   dtstart=row.dtstart.strftime("%Y-%m-%d %H:%M:%S"),
                   duration=duration,
                   title=row.title,
                   location=row.location,
                   location_info=row.location_info,
                   position=(point.x, point.y),
                   price=("%.2f $" % row.price) if row.price else 'GRATUIT',
                   distance="%0.1f" % row.distance_1,
                   categ_name=row.category_name,
                   categ_icon=row.icon_name,
                   arrond_name=row.arrondissement_name,
                   arrond_phone=nice_phone,
                   )
        out.update(Activity._format_date(row, past))
        return out
        
    @staticmethod
    def _format_date(row, past):
        today = datetime.date.today()
        now = datetime.datetime.now()
        out = {}
        row_dt = row.dtstart
        row_date = row_dt.date()
        if past:
            out['ends_label'] = "TERMINE DANS"
            out['ends_time'] = Activity._relative_time(now, row.dtend)
        elif row_date == today:
            if now + datetime.timedelta(0, 14400) > row_dt: # h
                out['today_label'] = u"DÉBUTE DANS"
                out['today_time'] = Activity._relative_time(row_dt, now)
            else:
                out['today_label'] = "AUJOURD'HUI"
                out['today_time'] = row_dt.strftime("%H:%M")
        else:
            demain = today + datetime.timedelta(1)
            if demain == row_date:
                out['later_label'] = 'DEMAIN'
            else:
                jour = row_dt.strftime("%d").lstrip('0')
                mois = row_dt.strftime("%b").upper()
                out['later_label'] = "%s %s" % (jour, mois)
            out['later_time'] = row_dt.strftime("%H:%M")
        return out
        
    @staticmethod
    def _relative_time(date, now):
        """Return a relative time in the format:

        1h
        30 min.
        45 min.
        1h 45m
        3h 25m
        """
        delta = abs(date - now).seconds
        if delta >= 3600:
            if delta % 3600:
                div, mod = divmod(delta, 3600)
                return "%dh %dm" % (div, int(round(mod / 60.0)))
            else:
                return "%dh" % (delta / 3600.0)
        else:
            return "%d min." % (int(round(delta / 60.0)))
            

GeometryDDL(Activity.__table__)


class Occurence(Base):
    __tablename__= "occurences"
    id = Column(Integer, primary_key=True)
    title = Column(Unicode(255))
    activity_id = Column(Integer, ForeignKey("activities.id"))
    activity = relationship(Activity)
    dtstart = Column(DateTime)
    dtend = Column(DateTime)

    @property
    def duration(self):
        delta = abs(self.dtend - self.dtstart)
        return delta.seconds + delta.days * 84600

    @property
    def linear_row(self):
        point = wkb.loads(str(self.activity.position.geom_wkb))
        return dict(activity_id=self.activity_id,
                    dtstart=self.dtstart.strftime("%Y-%m-%d %H:%M:%S"),
                    duration=self.duration,
                    title=self.activity.title,
                    location=self.activity.location,
                    location_info=self.activity.location_info,
                    position=(point.x, point.y),
                    price=self.price,
                    )

def bb_to_polyon(bb_str):
    x1, y1, x2, y2  = bb_str.split(',')
    return "POLYGON((%s %s, %s %s, %s %s, %s %s, %s %s))" % \
        (x1, y1, x2, y1, x2, y2, x1, y2, x1, y1)

def lat_lon_to_point(point_str):
    return "POINT(%s  %s)" % tuple(point_str.split(','))

def extract_date_time(time_str):
    formats = ("%Y-%m-%d %H:%M:%S",  "%Y-%m-%d")
    for format in formats:
        try:
            return datetime.datetime.strptime(time_str, format)
        except ValueError:
            pass
    raise ValueError("Date format submitted not valid")
