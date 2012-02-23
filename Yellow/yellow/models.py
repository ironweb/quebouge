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
    )

from geoalchemy import (
    GeometryColumn,
    Point)


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

class Occurence(Base):
    __tablename__= "activities"
    id = Column(Integer, primary_key=True)    
    title = Column(Unicode(255))
    activity_id = Column(Integer, ForeignKey("activities.id"))
    activity = relationship(Activity)
    dtstart = Column(DateTime)
    dtend = Column(DateTime)
    
