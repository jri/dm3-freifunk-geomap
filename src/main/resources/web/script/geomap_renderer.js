function GeoMapRenderer() {

    // ------------------------------------------------------------------------------------------------ Constructor Code

    this.superclass = TopicmapRenderer
    this.superclass()

    // ------------------------------------------------------------------------------------------------------ Public API

    this.init = function() {
        $("#canvas-panel").append($("<div>").attr("id", "canvas"))
        this.resize()
        //
        OpenLayers.ImgPath = "/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/img/"
        //
        var map = new OpenLayers.Map("canvas");
        //
        var osm = new OpenLayers.Layer.OSM("OpenSteetMap");
        var gmap = new OpenLayers.Layer.Google("Google Maps");
        var markers = new OpenLayers.Layer.Markers("Access Points");
        // Note: the marker layer must be added to the map *before* markers are added to it.
        // Otherwise the maps projection isn't propagated and all markers appear at 0/0.
        map.addLayers([gmap, osm, markers]);
        map.addControl(new OpenLayers.Control.LayerSwitcher());
        map.setCenter(project(10, 51), 6);
        //
        // --- add markers ---
        var size = new OpenLayers.Size(21, 25);
        var offset = new OpenLayers.Pixel(-size.w / 2, -size.h);
        var icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
        //
        markers.addMarker(new OpenLayers.Marker(project(13, 52), icon));
        // add 2nd marker
        // Note: you should not share icons between markers. Clone them instead.
        markers.addMarker(new OpenLayers.Marker(project(10, 51), icon.clone()));

        // Transforms lon/lat into meters.
        function project(lon, lat) {
            return new OpenLayers.LonLat(lon, lat).transform(
                new OpenLayers.Projection("EPSG:4326"),
                map.getProjectionObject()
            )
        }
    }

    // === Overriding TopicmapRenderer Adapter Methods ===

    this.resize = function() {
        // alert("GeoMapRenderer.resize(): width=" + this.canvas_width + " height=" + this.canvas_height)
        $("#canvas").width(this.canvas_width).height(this.canvas_height)
    }
}
