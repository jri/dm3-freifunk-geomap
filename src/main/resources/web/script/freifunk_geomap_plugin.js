function freifunk_geomap_plugin() {

    var FREIFUNK_WORKSPACE_NAME = "Freifunk"

    dm3c.css_stylesheet("/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/theme/default/style.css")
    dm3c.css_stylesheet("/net.freifunk.dm3-freifunk-geomap/style/openlayers-overrides.css")

    dm3c.javascript_source("/net.freifunk.dm3-freifunk-geomap/script/geomap_renderer.js")
    dm3c.javascript_source("/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/OpenLayers.js")
    dm3c.javascript_source(
        "http://maps.google.com/maps/api/js?sensor=false&callback=freifunk_geomap_plugin.init_renderer")

    var LOG = false
    var self = this

    var access_control
    var freifunk_workspace

    if (LOG) dm3c.log("DM3 Freifunk Geomap: instantiating topicmap renderer")
    this.geomap = new GeoMapRenderer()

    // ------------------------------------------------------------------------------------------------------ Public API



    // ************************************************************
    // *** Webclient Hooks (triggered by deepamehta3-webclient) ***
    // ************************************************************



    this.init = function() {
        access_control = dm3c.get_plugin("accesscontrol_plugin")
        // FIXME: use acutal key instead "default". Backend must implement "multiple indexmodes".
        freifunk_workspace = dm3c.restc.get_topic("de/deepamehta/core/topictype/Workspace",
            /* "de/deepamehta/core/property/Name" */ "default", FREIFUNK_WORKSPACE_NAME)
    }

    this.get_canvas_renderer = function() {
        if (LOG) dm3c.log("DM3 Freifunk Geomap: topicmap renderer=" + this.geomap)
        return this.geomap
    }

    /**
     * Once an access point is created relate it to the user's freikarte.
     */
    this.post_create_topic = function(topic) {
        if (topic.type_uri == "net/freifunk/topictype/access_point") {
            assign_access_point(topic, get_freikarte())
        } else if (topic.type_uri == "net/freifunk/topictype/community") {
            join_community(topic, get_freikarte())
        }
    }

    /**
     * Once an access point's geo-relevant properties ("street", "city", "postal code") are changed
     * we invoke the geocoder and (re)position the access point's marker.
     */
    this.post_update_topic = function(topic, old_properties) {

        if (topic.type_uri == "net/freifunk/topictype/freikarte") {
            create_user()
            adjust_marker("Freikarten")
        } else if (topic.type_uri == "net/freifunk/topictype/access_point") {
            adjust_marker("Access Points")
        }

        function create_user() {
            var username = topic.properties["net/freifunk/property/username"]
            var old_username = old_properties["net/freifunk/property/username"]
            if (username != old_username) {
                var password = topic.properties["net/freifunk/property/password"]
                var user = access_control.create_user(username, password)
                access_control.set_owner(topic.id, user.id)
                access_control.create_acl_entry(topic.id, "owner", {"write": true})
                access_control.join_workspace(freifunk_workspace.id, user.id)
                access_control.login(user)
            }
        }

        function adjust_marker(layer_name) {
            var street      = topic.properties["de/deepamehta/core/property/street"]
            var city        = topic.properties["de/deepamehta/core/property/city"]
            var postal_code = topic.properties["de/deepamehta/core/property/postal_code"]
            var old_street      = old_properties["de/deepamehta/core/property/street"]
            var old_city        = old_properties["de/deepamehta/core/property/city"]
            var old_postal_code = old_properties["de/deepamehta/core/property/postal_code"]
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
                self.geomap.geocode(address, position_marker)
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
                    self.geomap.add_marker(layer_name, pos, topic)
                    self.geomap.set_center(pos)
                    dm3c.render_topic()
                } else {
                    if (LOG) dm3c.log("ERROR while geocoding: " + status)
                }
            }
        }
    }

    /**
     * Once an access point is deleted we remove its marker.
     */
    this.post_delete_topic = function(topic) {
        if (topic.type_uri == "net/freifunk/topictype/freikarte") {
            self.geomap.remove_marker("Freikarten", topic.id)
        } else if (topic.type_uri == "net/freifunk/topictype/access_point") {
            self.geomap.remove_marker("Access Points", topic.id)
        }
    }

    this.add_topic_commands = function(topic) {

        var commands = []
        //
        if (topic.type_uri == "net/freifunk/topictype/community") {
            // Note: if we have the permission to create a community (that is the user is logged in)
            // we also have the permission to join and leave communities.
            if (dm3c.has_create_permission("net/freifunk/topictype/community")) {
                var freikarte = get_freikarte()
                if (is_community_member(topic, freikarte)) {
                    commands.push({
                        label: "Leave Community",
                        handler: do_leave_community,
                        context: "detail-panel-show",
                        ui_icon: "minus"
                    })
                } else {
                    commands.push({
                        label: "Join Community",
                        handler: do_join_community,
                        context: "detail-panel-show",
                        ui_icon: "person"
                    })
                }
            }
        }
        //
        return commands

        function do_join_community() {
            join_community(topic, freikarte)
            dm3c.render_topic()
        }

        function do_leave_community() {
            leave_community(topic, freikarte)
            dm3c.render_topic()
        }
    }


    // ----------------------------------------------------------------------------------------------- Private Functions

    /**
     * Return the Freikarte of the logged in user.
     */
    function get_freikarte() {
        var user = access_control.get_user()
        return get_freikarte_by_user(user)
    }

    /**
     * Returns the Freikarte that corresponds to a DeepaMehta user.
     */
    function get_freikarte_by_user(user) {
        return access_control.get_topic_by_owner(user.id, "net/freifunk/topictype/freikarte")
    }

    /**
     * Assigns an access point to a Freikarte.
     */
    function assign_access_point(access_point, freikarte) {
        dm3c.create_relation("ACCESS_POINT_OWNER", access_point.id, freikarte.id)
    }

    /**
     * Assigns a Freifunk Community to a Freikarte.
     */
    function join_community(community, freikarte) {
        dm3c.create_relation("FREIFUNK_COMMUNITY_MEMBER", community.id, freikarte.id)
    }

    function leave_community(community, freikarte) {
        var relation = is_community_member(community, freikarte)
        dm3c.delete_association(relation.id)
    }

    function is_community_member(community, freikarte) {
        return dm3c.restc.get_relation(community.id, freikarte.id, "FREIFUNK_COMMUNITY_MEMBER", true)
    }
}

freifunk_geomap_plugin.init_renderer = function() {
    dm3c.get_plugin("freifunk_geomap_plugin").geomap.init([
        {name: "Freikarten",    icon_file: "marker-blue.png", type_uri: "net/freifunk/topictype/freikarte"},
        {name: "Access Points", icon_file: "marker.png",      type_uri: "net/freifunk/topictype/access_point"}
    ])
}
