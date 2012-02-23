from sqlalchemy import (
    Column,
    Integer,
    Text,
    Unicode,
    UnicodeText,
    ForeignKey,
    DateTime,
    )

from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.orm import (
    scoped_session,
    sessionmaker,
    relationship
    )

from geoalchemy import (
    GeometryColumn,
    Point,
    GeometryDDL,
    )


from zope.sqlalchemy import ZopeTransactionExtension

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
    position = GeometryColumn(Point(2))
GeometryDDL(Activity.__table__)


    @classmethod
    def query_from_params(cls, params=None):
        if params is None: params = {}
        query = DBSession.query(cls)
        if 'bb' in params:
            query.filter(cls.position.within(bb_to_polyon(params['bb'])))

        return query


class Occurence(Base):
    __tablename__= "occurences"
    id = Column(Integer, primary_key=True)
    title = Column(Unicode(255))
    activity_id = Column(Integer, ForeignKey("activities.id"))
    activity = relationship(Activity)
    dtstart = Column(DateTime)
    dtend = Column(DateTime)



def bb_to_polyon(bb_str):
    x1, y1, x2, y2  = bb_str.split(',')
    polygon_path = x1, y1, x2, y1, x2, y2, x1, y2
    return "POINT(%s)" % ', '.join(polygon_path)

def lat_lon_to_point(point_str):
    return "POINT(%s, %s)" % point_str.slit(',')

