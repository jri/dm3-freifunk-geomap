function GeoMapRenderer() {

    // ------------------------------------------------------------------------------------------------ Constructor Code

    this.superclass = TopicmapRenderer
    this.superclass()

    var self = this

    // ------------------------------------------------------------------------------------------------------ Public API

    this.init = function() {
        $("#canvas-panel").append($("<div>").attr("id", "canvas"))
        this.resize()
        //
        OpenLayers.ImgPath = "/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/img/"
        //
        var map = new OpenLayers.Map("canvas", {
            controls: []
        })
        var markers = new OpenLayers.Layer.Markers("Access Points")

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
            markers
        ])
        map.addControl(new OpenLayers.Control.Navigation({'zoomWheelEnabled': false}))
        map.addControl(new OpenLayers.Control.ZoomPanel())
        map.addControl(new OpenLayers.Control.LayerSwitcher())
        //
        map.setCenter(transform(11, 51), 6)

        // === Methods ===

        this.geocode = function() {
            var geocoder = new google.maps.Geocoder()
            return function(address, callback) {
                geocoder.geocode({address: address}, callback)
            }
        }()

        this.add_access_point = function() {
            var size = new OpenLayers.Size(21, 25)
            var offset = new OpenLayers.Pixel(-size.w / 2, -size.h)
            var icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset)
            return function(pos) {
                // Note: you should not share icons between markers. Clone them instead.
                markers.addMarker(new OpenLayers.Marker(transform(pos.lon, pos.lat), icon.clone()));
            }
        }()
        
        this.set_center = function(pos) {
            map.setCenter(transform(pos.lon, pos.lat))
        }

        // === Private Functions ===

        function show_access_points() {
            var access_points = dm3c.restc.get_topics("net/freifunk/topictype/freikarte")
            for (var i = 0, ap; ap = access_points[i]; i++) {
                var lon = ap.properties["de/deepamehta/core/property/longitude"]
                var lat = ap.properties["de/deepamehta/core/property/latitude"]
                self.add_access_point({lon: lon, lat: lat})
            }
        }

        // ===

        show_access_points()
    }



    // ***************************************************
    // *** Overriding TopicmapRenderer Adapter Methods ***
    // ***************************************************



    this.resize = function() {
        // alert("GeoMapRenderer.resize(): width=" + this.canvas_width + " height=" + this.canvas_height)
        $("#canvas").width(this.canvas_width).height(this.canvas_height)
    }

    // ----------------------------------------------------------------------------------------------- Private Functions
}
