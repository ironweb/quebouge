#!/usr/bin/python
# -=- encoding: utf-8 -=-

from lxml import etree
from pprint import pprint

doc = etree.parse("LOISIR_PAYANT.XML")
root = doc.getroot()


def node_to_dict(node):
    ret = {}
    for el in node.getchildren():
        ret[el.tag] = el.text
    return ret

liste_adresses = set()
desc_act = set()
desc = set()
for activity in root.getchildren():
    d = node_to_dict(activity)
    liste_adresses.add(d['ADRESSE'])
    desc_act.add(d['DESCRIPTION_ACT'][:10])
    desc.add(d['DESCRIPTION'][:10])

print pprint(liste_adresses)
print pprint(desc_act)
print pprint(desc)
print len(liste_adresses), len(desc_act), len(desc)


    
