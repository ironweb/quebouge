#!/usr/bin/python
# -=- encoding: utf-8 -=-

from lxml import etree
from pprint import pprint
import re

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
out = re.compile(r"vacances|Famille Atout")
d = {'arts martiaux': [
        'escrime',
        ],
     'sports aquatiques': [
        ],
     'arts et culture': [
        ],
     'sports/plein air': {
        'sports de glace': [
            'ballon sur glace',
            ]
        
        },
     'gymnastique': {
        'yoga': [
            'yoga'
            ],
        },
     'danse': {
        'autre': [
            'baladi',
            'danse',
            ]
        }
     }

desc1_occur = {}
for activity in root.getchildren():
    d = node_to_dict(activity)
    splitter = r',| |\t|-|/|\(|\)'
    desc1 = re.split(splitter, d['DESCRIPTION'])
    for word in desc1:
        lword = word.lower()
        if lword in desc1_occur:
            desc1_occur[lword] += 1
        else:
            desc1_occur[lword] = 0
        
    if out.search(d['DESCRIPTION_ACT']) or \
            out.search(d['DESCRIPTION']):
        continue

    if d['DESCRIPTION_ACT'] in desc_act:
        continue
    if d['DESCRIPTION'] in desc:
        continue
    print "%42s%44s" % (d['DESCRIPTION_ACT'], d['DESCRIPTION'])
    desc_act.add(d['DESCRIPTION_ACT'])
    desc.add(d['DESCRIPTION'])
    liste_adresses.add(d['ADRESSE'])


for word in (u"à", "chanterelle", '', u"physique","vacances",u"été",u"régulier",
             "3", "5", "1", "2", "6", "mer", "pve", "camp", "niveau", "de",
             "junior", "cours", "surveillance", "du", "8", "9", "10",
             "canard", "tortue", u"école", "4", "7", "tou", "vanier",
             "salamandre", "programme", "ans", "lune", "poisson",
             "les", "en", u"activités", "mois", "\\", u"intermédiaire",
             ):
    del desc1_occur[word]

l = desc1_occur.items()
pprint(sorted(l, key=lambda x: x[1]))
#pprint(liste_adresses)
#pprint(desc_act)
#pprint(desc)
#len(liste_adresses), len(desc_act), len(desc)


    
