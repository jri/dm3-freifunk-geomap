/**
 * A topicmap renderer that displays a geo map in the background. The rendering is based on OpenLayers library.
 *
 * OpenLayers specifics are encapsulated. The caller must not know about OpenLayers API usage.
 */
function GeoMapRenderer() {

    // ------------------------------------------------------------------------------------------------ Constructor Code

    this.superclass = TopicmapRenderer
    this.superclass()

    var map
    var marker_layers = {}

    // ------------------------------------------------------------------------------------------------------ Public API

    // === Overriding TopicmapRenderer Adapter Methods ===

    this.resize = function() {
        if (dm3c.LOG_GUI) dm3c.log("Resizing geomap canvas to " + this.canvas_width + "x" + this.canvas_height)
        $("#canvas").width(this.canvas_width).height(this.canvas_height)
    }

    // ------------------------------------------------------------------------------------------------ Constructor Code

    $("#canvas-panel").append($("<div>").attr("id", "canvas"))
    this.resize()

    // ------------------------------------------------------------------------------------------------------ Public API

    this.init = function(marker_layer_info) {
        OpenLayers.ImgPath = "/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/img/"
        //
        map = new OpenLayers.Map("canvas", {
            controls: []
        })
        map.addLayers([
            new OpenLayers.Layer.OSM("OpenSteetMap"),
            new OpenLayers.Layer.Google("Google Maps")
        ])
        map.addControl(new OpenLayers.Control.Navigation({'zoomWheelEnabled': false}))
        map.addControl(new OpenLayers.Control.ZoomPanel())
        map.addControl(new OpenLayers.Control.LayerSwitcher())
        map.setCenter(transform(11, 51), 6)
        //
        for (var i = 0, ml; ml = marker_layer_info[i]; i++) {
            marker_layers[ml.name] = new MarkerLayer(ml.name, ml.icon_file, ml.type_uri)
        }

        // === Public API ===

        this.geocode = function() {
            var geocoder = new google.maps.Geocoder()
            return function(address, callback) {
                geocoder.geocode({address: address}, callback)
            }
        }()

        this.set_center = function(pos) {
            map.setCenter(transform(pos.lon, pos.lat))
        }
    }

    this.add_marker = function(layer_name, pos, topic) {
        marker_layers[layer_name].add_marker(pos, topic)
    }

    this.remove_marker = function(layer_name, topic_id) {
        marker_layers[layer_name].remove_marker(topic_id)
    }

    function MarkerLayer(layer_name, icon_file, type_uri) {
        var self = this
        var markers = {}    // holds the OpenLayers.Marker objects, keyed by topic ID
        var markers_layer = new OpenLayers.Layer.Markers(layer_name)
        map.addLayer(markers_layer)

        // === Public API ===

        this.add_marker = function() {
            var size = new OpenLayers.Size(21, 25)
            var offset = new OpenLayers.Pixel(-size.w / 2, -size.h)
            var icon = new OpenLayers.Icon('/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/img/' +
                icon_file, size, offset)
            // - alternate marker -
            // var size = new OpenLayers.Size(28, 28)
            // var offset = new OpenLayers.Pixel(-13, -13)
            // var icon = new OpenLayers.Icon('/net.freifunk.dm3-freifunk-geomap/images/wlan-small.png',
            // size, offset)
            return function(pos, topic) {
                // if the marker is already on the map, remove it
                if (markers[topic.id]) {
                    markers_layer.removeMarker(markers[topic.id])
                }
                // Note: you should not share icons between markers. Clone them instead.
                var marker = new OpenLayers.Marker(transform(pos.lon, pos.lat), icon.clone())
                marker.events.register("click", topic, marker_clicked)
                markers[topic.id] = marker
                markers_layer.addMarker(marker)

                function marker_clicked() {
                    dm3c.render_topic(this.id)
                }
            }
        }()

        this.remove_marker = function(topic_id) {
            markers_layer.removeMarker(markers[topic_id])
        }

        show_topics()

        // === Private Functions ===

        function show_topics() {
            var topics = dm3c.restc.get_topics(type_uri)
            for (var i = 0, topic; topic = topics[i]; i++) {
                var lon = topic.properties["de/deepamehta/core/property/longitude"]
                var lat = topic.properties["de/deepamehta/core/property/latitude"]
                self.add_marker({lon: lon, lat: lat}, topic)
            }
        }
    }

    // Transforms lon/lat coordinates according to this map's projection.
    var transform = function() {
        // Note: this way the projection object is created only once and is not visible outside.
        var projection = new OpenLayers.Projection("EPSG:4326")     // EPSG:4326 is *lon/lat* projection
        return function(lon, lat) {
            return new OpenLayers.LonLat(lon, lat).transform(
                projection, map.getProjectionObject()
            )
        }
    }()
}
