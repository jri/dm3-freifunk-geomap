
DM3 Freifunk Geomap
===================

This DeepaMehta 3 plugin realizes a Freifunk community application. Freifunk participants can register and provide information about themself and their access points. The access points are displayed on a geographical map (the user can choose between Google Maps and OpenStreetMap). Additionally, access points can be searched e.g. by user's real name, description, or city. The DM3 Freifunk Geomap plugin is designed to work in conjunction with the [DeepaMehta 3 Access Control](http://github.com/jri/deepamehta3-accesscontrol) plugin. The geo maps are realized by the means of [OpenLayers](http://openlayers.org/).

Freifunk (German for "free radio") is an international project for open and free Wireless Networks with free frequencies for everyone. Based on open software and industry standards.  
<http://www.freifunk.net/>

DeepaMehta 3 is a platform for collaboration and knowledge management.  
<http://github.com/jri/deepamehta3>


Installing
----------

Install the DM3 Freifunk Geomap plugin via the Apache Felix shell (the terminal window that opens while starting DeepaMehta):

1. Activate the [DeepaMehta 3 Access Control](http://github.com/jri/deepamehta3-accesscontrol) plugin.

2. Download and start the DM3 Freifunk Geomap plugin:

        start http://www.deepamehta.de/maven2/net/freifunk/dm3-freifunk-geomap/0.2/dm3-freifunk-geomap-0.2.jar

   When using the `lb` command you should now see the DM3 Freifunk Geomap plugin as *Active*.

3. You're done. Open the DeepaMehta browser window (resp. press reload):  
   <http://localhost:8080/de.deepamehta.3-client/index.html>


Usage
-----

* Create an access point by choosing *Freikarte* from the topic type menu and press the *Create* button. Fill out the form. Once you press the *Save* button DeepaMehta 1) creates an corresponding user account and logs the user in, and 2) places the access point on the geo map.

  **Note:** DeepaMehta determines the geo location by means of the *PLZ* (postal code), *Stadt* (city), and *Straße* (street) fields. Entering a city is sufficient. Exact placement depends on street and house number.

* Search for access points e.g. by user's real name, description, or city.

* Once logged in a user can edit her own access point. Login via the *Special* menu.

* Logout via the *Special* menu.

**Note:** Once the DM3 Freifunk Geomap plugin has been installed and started DeepaMehta turns into an exclusive interface for the Freifunk application application. That is the canvas turns into a geo map. While you can still perform all DeepaMehta operations the typical topicmaps are not longer displayed. This is the state of affairs; future versions of the DM3 Freifunk Geomap plugin might friendly co-exist with the typical DeepaMehta topicmap display.

To return to the typical DeepaMehta user interface stop the DM3 Freifunk Geomap plugin.


Stopping
--------

Stop the DM3 Freifunk Geomap plugin via the Apache Felix shell (the terminal window that opens while starting DeepaMehta):

1. Find out the bundle ID of the DM3 Freifunk Geomap plugin by using the `lb` command (list bundles):

        lb

   You will find the DM3 Freifunk Geomap plugin and its bundle ID (it is supposed to be 40 or something like that) in the displayed list of bundles:

        ID|State      |Level|Name
        ..|..         |..   |..
        40|Active     |    1|DM3 Freifunk Geomap (0.2.0)

2. Stop the DM3 Freifunk Geomap plugin by using the `stop` command:

        stop 40

   When using the `lb` command again you see the DM3 Freifunk Geomap plugin is now in *Resolved* state (means not active):

        39|Resolved   |    1|DM3 Freifunk Geomap (0.2.0)

3. You're done. Open the DeepaMehta browser window (resp. press reload):  
   <http://localhost:8080/de.deepamehta.3-client/index.html>

   The typical DeepaMehta user interface is back.


Version History
---------------

**v0.2** -- Nov 25, 2010

* Works in conjunction with [DeepaMehta 3 Access Control](http://github.com/jri/deepamehta3-accesscontrol) plugin.
    * A user can edit only its own access point.
    * Login, logout.
* Compatible with DeepaMehta 3 v0.4.3

**v0.1** -- Oct 26, 2010

* Basic functionality:
    * Creating, editing, searching, and deleting access points.
    * Displaying access points on a geo map.
* Compatible with DeepaMehta 3 v0.4.2


------------
Jörg Richter  
Nov 25, 2010
