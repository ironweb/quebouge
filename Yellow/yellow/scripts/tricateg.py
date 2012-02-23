#!/usr/bin/python
# -=- encoding: utf-8 -=-

from lxml import etree
from pprint import pprint
import re
from datetime import datetime


class DatabaseNode(object):
    def __init__(self, node):
        self.raw_node = node
        self.node = self._to_dict()

        start = self.node['DATE_DEB'] + ' ' + self.node['HEURE_DEBUT']
        end = self.node['DATE_DEB'] + ' ' + self.node['HEURE_FIN']
        
        until = self.node['DATE_FIN'] + ' 23:59:59'
        full_format = "%Y-%m-%d %H:%M:%S"

        self.dt_start = datetime.strptime(start, full_format)
        self.dt_end = datetime.strptime(end, full_format)
        self.dt_until = datetime.strptime(until, full_format)
        self.duration = abs(self.dt_end - self.dt_start)

    @property
    def description(self):
        return self._extract_bigger_field(self.node['DESCRIPTION'],
                                          self.node['DESCRIPTION_ACT'])

    def _to_dict(self):
        ret = {}
        for el in self.raw_node.getchildren():
            ret[el.tag] = el.text
        return ret

    @property
    def tarif(self):
        if 'TARIF_BASE' in self.node:
            return float(self.node['TARIF_BASE'])
        return 0.0

    @property
    def occurences(self):
        from dateutil import rrule
        r = rrule.rrule(rrule.WEEKLY, dtstart=self.dt_start,
                        until=self.dt_until)
        ruleset = rrule.rruleset()
        ruleset.rrule(r)
        return [Occurence(stamp, self) for stamp in ruleset]

    @property
    def adresse(self):
        return self.node['ADRESSE']

    @property
    def location_info(self):
        return self._extract_bigger_field(self.node['LIEU_1'],
                                          self.node['LIEU_2'])

    def _extract_bigger_field(self, v1, v2):
        """Returns the biggest of two string if one is contained within the
        other. Concatenate both otherwise"""
        if v1 in v2:
            desc = v2
        elif v2 in v1:
            desc = v1
        else:
            desc = "%s, %s" % (v1, v2)
        return desc

class Occurence(object):
    def __init__(self, start_datetime, activity):
        self.start_datetime = start_datetime
        self.activity = activity


class MotChecker(object):
    def __init__(self, pattern, categ=None):
        self.regexp = re.compile(pattern)
        if categ:
            self.categ = categ
        else:
            self.categ = pattern
        self._pattern = pattern
        self.matches = []
        self.matches_nodes = []
    def search(self, node):
        string = node.description
        lower_string = string.lower()
        res = bool(self.regexp.search(lower_string))
        if res:
            self.matches.append(string)
            self.matches_nodes.append(node)
        return res
    @property
    def matched_set(self):
        return set(self.matches)



def import_xml_data():
    # Loader les patterns
    mots_reg = {}
    check_list = []
    for mot in open('../datasets/CATEGORIZATION.txt'):
        pattern_categ = mot.strip().split(',')
        chk = MotChecker(pattern_categ[0], None if len(pattern_categ) < 2 else pattern_categ[1])
        check_list.append(chk)

    doc1 = etree.parse("../datasets/LOISIR_PAYANT.XML")
    doc2 = etree.parse("../datasets/LOISIR_LIBRE.XML")
    root1 = doc1.getroot()
    root2 = doc2.getroot()

    # Checker chaque ligne du dataset avec les patterns pour les catégoriser
    res_by_mot = {}
    from itertools import chain
    for activity in chain(root1.getchildren(), root2.getchildren()):
        node = DatabaseNode(activity)
        # On skip les activités payantes ?
        if node.tarif > 15:
            continue
        # On catégorise
        for checker in check_list:
            if checker.search(node):
                break

    return check_list

    # On affiche le tout pour débugger
    for checker in check_list:
        print "=" * 100
        print "PATTERN: %s, CATEG: %s" % (checker._pattern, checker.categ)
        print len(checker.matched_set)
        if not checker._pattern:
            print "SKIP PRINT"
            #pprint(checker.matches)
        else:
            pprint(checker.matches)

    return check_list

