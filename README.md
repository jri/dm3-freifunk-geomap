
DeepaMehta 3 Freifunk Geomap
============================

DeepaMehta 3 plugin to display the Freifunk access points geographically along their relationships to the Freifunk community.

Freifunk meaning Free Radio, is an international project for open and free Wireless Networks with free frequencies for everyone. Based on open software and industry standards.
<http://www.freifunk.net/>

DeepaMehta 3 is a platform for collaboration and knowledge management.
DeepaMehta 3 is highly modularized software. The main module and installation instructions:
<http://github.com/jri/deepamehta3>


Requirements
------------

* A DeepaMehta 3 installation  
  <http://github.com/jri/deepamehta3>


Install
-------

In the Apache Felix shell:

    start http://www.deepamehta.de/maven2/net/freifunk/dm3-freifunk-geomap/0.1/dm3-freifunk-geomap-0.1.jar


Usage Hints
-----------

Create an access point by choosing *Freikarte* from the topic type menu and press the *Create* button. Fill out the form. Once you press the *Save* button DeepaMehta places the access point on the geo map.

**Note:** DeepaMehta determines the geo location by means of the *PLZ* (postal code), *Stadt* (city), and *Straße* (street) fields. Entering a city is sufficient. Exact placement depends on street and house number.


Version History
---------------

**v0.1** -- Oct 26, 2010

* Basic functionality:
    * Creating, editing, searching, and deleting access points.
    * Displaying access points on a geo map.
* Compatible with DeepaMehta 3 v0.4.2


------------
Jörg Richter  
Oct 26, 2010
