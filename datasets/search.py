#!/usr/bin/python
# -=- encoding: utf-8 -=-

from lxml import etree

doc = etree.parse("LOISIR_PAYANT.XML")
root = doc.getroot()


def node_to_dict(node):
    ret = {}
    for el in node.getchildren():
        ret[el.tag] = el.text
    return ret

for activity in root.getchildren():
    d = node_to_dict(activity)
    print d


    
