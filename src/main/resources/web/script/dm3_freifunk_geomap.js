function dm3_freifunk_geomap() {

    dm3c.css_stylesheet("/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/theme/default/style.css")
    dm3c.css_stylesheet("/net.freifunk.dm3-freifunk-geomap/style/openlayers-overrides.css")

    dm3c.javascript_source("/net.freifunk.dm3-freifunk-geomap/script/geomap_renderer.js")
    dm3c.javascript_source("/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/OpenLayers.js")
    dm3c.javascript_source("http://maps.google.com/maps/api/js?sensor=false&callback=dm3_freifunk_geomap.init_renderer")

    var LOG = false
    if (LOG) dm3c.log("DM3 Freifunk Geomap: instantiating canvas renderer")
    var self = this
    self.geomap = new GeoMapRenderer()

    // ------------------------------------------------------------------------------------------------------ Public API



    // *******************************
    // *** Overriding Plugin Hooks ***
    // *******************************



    this.get_canvas_renderer = function() {
        if (LOG) dm3c.log("DM3 Freifunk Geomap: canvas renderer=" + this.geomap)
        return this.geomap
    }

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
                this.geomap.geocode(address, update_marker)
            }
        }

        function update_marker(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var location = results[0].geometry.location
                var pos = {lon: location.c, lat: location.b}
                if (LOG) dm3c.log("Geocoder was successful!\n..... " + results[0].formatted_address +
                    "\n..... lon=" + location.c + "\n..... lat=" + location.b)
                // 1) update DB and memory
                dm3c.update_topic(topic, {
                    "de/deepamehta/core/property/longitude": location.c,
                    "de/deepamehta/core/property/latitude":  location.b
                })
                // 2) update GUI
                dm3c.render_topic()
                self.geomap.set_center(pos)
                self.geomap.add_access_point(pos)
            } else {
                if (LOG) dm3c.log("ERROR while geocoding: " + status)
            }
        }
    }

    // ----------------------------------------------------------------------------------------------- Private Functions
}

dm3_freifunk_geomap.init_renderer = function() {
    dm3c.get_plugin("dm3_freifunk_geomap").geomap.init()
}
