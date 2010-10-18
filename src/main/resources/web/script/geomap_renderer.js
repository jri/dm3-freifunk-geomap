function GeoMapRenderer() {

    // ------------------------------------------------------------------------------------------------ Constructor Code

    // ------------------------------------------------------------------------------------------------------ Public API

    this.init = function() {
        OpenLayers.ImgPath = "/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/img/"
        //
        $("#canvas-panel").css({width: 500, height: 300})
        var map = new OpenLayers.Map("canvas-panel");
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

    // ------------------------------------------------------------------------------------------------------ Public API

    // === Implementation of the "Canvas Renderer" interface (actually the public Canvas API) ===

    this.add_topic = function() {
    }

    this.add_relation = function() {
    }

    this.set_topic_label = function() {
    }

    this.scroll_topic_to_center = function() {
    }

    this.refresh = function() {
    }

    this.clear = function() {
    }

    this.resize = function() {
    }
}
