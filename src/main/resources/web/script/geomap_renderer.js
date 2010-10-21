function GeoMapRenderer() {

    // ------------------------------------------------------------------------------------------------ Constructor Code

    this.superclass = TopicmapRenderer
    this.superclass()

    var transform
    var markers
    var geocoder
    var icon

    // ------------------------------------------------------------------------------------------------------ Public API

    this.init = function() {
        $("#canvas-panel").append($("<div>").attr("id", "canvas"))
        this.resize()
        //
        OpenLayers.ImgPath = "/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/img/"
        //
        var map = new OpenLayers.Map("canvas");
        //
        transform = get_transformer(new OpenLayers.Projection("EPSG:4326"))     // EPSG:4326 is *long/lat* projection
        //
        var osm = new OpenLayers.Layer.OSM("OpenSteetMap");
        var gmap = new OpenLayers.Layer.Google("Google Maps");
        markers = new OpenLayers.Layer.Markers("Access Points");
        // Note: the marker layer must be added to the map *before* markers are added to it.
        // Otherwise the maps projection isn't propagated and all markers appear at 0/0.
        map.addLayers([gmap, osm, markers]);
        map.addControl(new OpenLayers.Control.LayerSwitcher());
        map.setCenter(transform(10, 51), 6);
        //
        // --- add markers ---
        var size = new OpenLayers.Size(21, 25);
        var offset = new OpenLayers.Pixel(-size.w / 2, -size.h);
        icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
        //
        markers.addMarker(new OpenLayers.Marker(transform(13, 52), icon));
        // add 2nd marker
        // Note: you should not share icons between markers. Clone them instead.
        markers.addMarker(new OpenLayers.Marker(transform(10, 51), icon.clone()));
        //
        geocoder = new google.maps.Geocoder()

        // Returns a function that transforms coordinates of the given projection into projection of this map.
        // (This way the projection object is created only once and is not visible outside.)
        function get_transformer(projection) {
            return function(lon, lat) {
                return new OpenLayers.LonLat(lon, lat).transform(
                    projection, map.getProjectionObject()
                )
            }
        }
    }

    this.geocode = function(address, callback) {
        geocoder.geocode({address: address}, callback)
    }

    this.add_access_point = function(pos) {
        markers.addMarker(new OpenLayers.Marker(transform(pos.long, pos.lat), icon.clone()));
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
