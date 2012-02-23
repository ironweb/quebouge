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

    # joinedload
    @staticmethod
    def query_from_params(params):
        """Params:
        
        ``latlon`` requis pour tous les calls (pour la distance).
        ``bb`` est le bounding box
        ``radius`` dans une unité inconnue à ce jour
        """
        latlon = lat_lon_to_point(params['latlon'])
        distance = functions.distance(Activity.position,
                                      "POINT(46.8 -72.3)")
        q = sql.select([Occurence.activity_id, Occurence.dtstart,
                        Occurence.dtend,
                        Activity.title, Activity.location,
                        Activity.location_info, Activity.position,
                        Activity.price, distance],
                       from_obj=Occurence.__table__.join(Activity.__table__))
        q = q.where(Occurence.activity_id == Activity.id)

        if 'bb' in params and 'radius' in params:
            raise ValueError('Invalid input : both `radius` and `bb` were submitted.')

        if 'bb' in params:
            q = q.where(Activity.position.within(bb_to_polyon(params['bb'])))

        if 'radius' in params:
            q = q.where(Activity.position.within(functions.buffer(latlon,
                                                  float(params['radius']))))
        if params.get('cat_id'):
            q = q.where(Activity.category_id == int(params['cat_id']))

        if 'start_dt' in params:
            dt_start = extract_date_time(params['start_dt'])
        else:
            dt_start = datetime.date.today()

        q = q.where(Occurence.dtstart >= dt_start)

        if 'end_dt' in params:
            q = q.where(Occurence.dtend <= extract_date_time(params['end_dt']))

        db = DBSession()
        res = db.execute(q)
        return [Activity._row_result_to_dict(row) for row in res]

    @staticmethod
    def _row_result_to_dict(row):
        point = wkb.loads(str(row.st_asbinary))
        delta = abs(row.dtend - row.dtstart)
        duration = delta.seconds + delta.days * 84600
        return dict(activity_id=row.activity_id,
                    dtstart=row.dtstart.strftime("%Y-%m-%d %H:%M:%S"),
                    duration=duration,
                    title=row.title,
                    location=row.location,
                    location_info=row.location_info,
                    position=(point.x, point.y),
                    price=row.price,
                    distance="%0.1f" % row.distance_1,
                    )

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
                    price=self.price)

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
