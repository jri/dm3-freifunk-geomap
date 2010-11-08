function dm3_freifunk_geomap() {

    dm3c.css_stylesheet("/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/theme/default/style.css")
    dm3c.css_stylesheet("/net.freifunk.dm3-freifunk-geomap/style/openlayers-overrides.css")

    dm3c.javascript_source("/net.freifunk.dm3-freifunk-geomap/script/geomap_renderer.js")
    dm3c.javascript_source("/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/OpenLayers.js")
    dm3c.javascript_source("http://maps.google.com/maps/api/js?sensor=false&callback=dm3_freifunk_geomap.init_renderer")

    var LOG = false
    var self = this

    if (LOG) dm3c.log("DM3 Freifunk Geomap: instantiating topicmap renderer")
    this.geomap = new GeoMapRenderer()

    // ------------------------------------------------------------------------------------------------------ Public API



    // *******************************
    // *** Overriding Plugin Hooks ***
    // *******************************



    this.get_canvas_renderer = function() {
        if (LOG) dm3c.log("DM3 Freifunk Geomap: topicmap renderer=" + this.geomap)
        return this.geomap
    }

    /**
     * Once an access point's geo-relevant properties ("street", "city", "postal code") are changed
     * we invoke the geocoder and (re)position the access point's marker.
     */
    this.post_update_topic = function(topic, old_properties) {
        if (topic.type_uri == "net/freifunk/topictype/freikarte") {
            var street      = topic.properties["net/freifunk/property/street"]
            var city        = topic.properties["net/freifunk/property/city"]
            var postal_code = topic.properties["net/freifunk/property/postal_code"]
            var old_street      = old_properties["net/freifunk/property/street"]
            var old_city        = old_properties["net/freifunk/property/city"]
            var old_postal_code = old_properties["net/freifunk/property/postal_code"]
            var street_changed      = old_street != street
            var city_changed        = old_city != city
            var postal_code_changed = old_postal_code != postal_code
            if (LOG) dm3c.log("Freikarte updated\n..... " +
                "street: \"" + old_street + "\" => \"" + street + "\" (" + street_changed + ")\n..... " +
                "city: \"" + old_city + "\" => \"" + city + "\" (" + city_changed + ")\n..... " +
                "postal_code: \"" + old_postal_code + "\" => \"" + postal_code + "\" (" + postal_code_changed + ")")
            //
            if (street_changed || city_changed || postal_code_changed) {
                var address = street + ", " + postal_code + " " + city
                this.geomap.geocode(address, position_marker)
            }
        }

        function position_marker(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var location = results[0].geometry.location     // location is a Google Maps LatLng object
                var pos = {lon: location.lng(), lat: location.lat()}
                if (LOG) dm3c.log(JSON.stringify(results))
                if (LOG) dm3c.log("Geocoder was successful!\n..... " + results[0].formatted_address +
                    "\n..... lon=" + location.lng() + "\n..... lat=" + location.lat())
                // 1) update DB and memory
                dm3c.update_topic(topic, {
                    "de/deepamehta/core/property/longitude": location.lng(),
                    "de/deepamehta/core/property/latitude":  location.lat()
                })
                // 2) update GUI
                self.geomap.add_marker(pos, topic)
                self.geomap.set_center(pos)
                dm3c.render_topic()
            } else {
                if (LOG) dm3c.log("ERROR while geocoding: " + status)
            }
        }
    }

    /**
     * Once an access point is deleted we remove its marker.
     */
    this.post_delete_topic = function(topic) {
        if (topic.type_uri == "net/freifunk/topictype/freikarte") {
            self.geomap.remove_marker(topic.id)
        }
    }

    // ----------------------------------------------------------------------------------------------- Private Functions
}

dm3_freifunk_geomap.init_renderer = function() {
    dm3c.get_plugin("dm3_freifunk_geomap").geomap.init()
}
