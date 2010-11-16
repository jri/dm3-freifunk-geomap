/**
 * A topicmap renderer that displays a geo map in the background. The rendering is based on OpenLayers library.
 *
 * OpenLayers specifics are encapsulated. The caller must not know about OpenLayers API usage.
 */
function GeoMapRenderer() {

    // ------------------------------------------------------------------------------------------------ Constructor Code

    this.superclass = TopicmapRenderer
    this.superclass()

    var self = this
    var markers = {}    // holds the OpenLayers.Marker objects, keyed by topic ID

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

    this.init = function() {
        OpenLayers.ImgPath = "/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/img/"
        //
        var map = new OpenLayers.Map("canvas", {
            controls: []
        })
        var markers_layer = new OpenLayers.Layer.Markers("Access Points")

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
        
        map.addLayers([
            new OpenLayers.Layer.Google("Google Maps"),
            new OpenLayers.Layer.OSM("OpenSteetMap"),
            markers_layer
        ])
        map.addControl(new OpenLayers.Control.Navigation({'zoomWheelEnabled': false}))
        map.addControl(new OpenLayers.Control.ZoomPanel())
        map.addControl(new OpenLayers.Control.LayerSwitcher())
        //
        map.setCenter(transform(11, 51), 6)

        // === Public API ===

        this.geocode = function() {
            var geocoder = new google.maps.Geocoder()
            return function(address, callback) {
                geocoder.geocode({address: address}, callback)
            }
        }()

        this.add_marker = function() {
            var size = new OpenLayers.Size(21, 25)
            var offset = new OpenLayers.Pixel(-size.w / 2, -size.h)
            var icon = new OpenLayers.Icon('/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/img/marker.png',
                size, offset)
            // - alternate marker -
            // var size = new OpenLayers.Size(28, 28)
            // var offset = new OpenLayers.Pixel(-13, -13)
            // var icon = new OpenLayers.Icon('/net.freifunk.dm3-freifunk-geomap/images/wlan-small.png', size, offset)
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
            }
        }()

        this.remove_marker = function(topic_id) {
            markers_layer.removeMarker(markers[topic_id])
        }

        this.set_center = function(pos) {
            map.setCenter(transform(pos.lon, pos.lat))
        }

        // === Private Functions ===

        function show_access_points() {
            var access_points = dm3c.restc.get_topics("net/freifunk/topictype/freikarte")
            for (var i = 0, ap; ap = access_points[i]; i++) {
                var lon = ap.properties["de/deepamehta/core/property/longitude"]
                var lat = ap.properties["de/deepamehta/core/property/latitude"]
                self.add_marker({lon: lon, lat: lat}, ap)
            }
        }

        function marker_clicked() {
            dm3c.render_topic(this.id)
        }

        // ===

        show_access_points()
    }
}
