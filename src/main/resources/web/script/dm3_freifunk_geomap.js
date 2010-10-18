function dm3_freifunk_geomap() {

    dm3c.css_stylesheet("/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/theme/default/style.css")

    dm3c.javascript_source("/net.freifunk.dm3-freifunk-geomap/script/vendor/openlayers/OpenLayers.js")
    dm3c.javascript_source("http://maps.google.com/maps/api/js?sensor=false&callback=dm3_freifunk_geomap.init_renderer")

    // ------------------------------------------------------------------------------------------------ Overriding Hooks

    this.get_canvas_renderer = function() {
        return dm3_freifunk_geomap.geomap_renderer
    }

    // ----------------------------------------------------------------------------------------------- Private Functions

}

dm3c.javascript_source("/net.freifunk.dm3-freifunk-geomap/script/geomap_renderer.js")

dm3_freifunk_geomap.geomap_renderer = new GeoMapRenderer()

dm3_freifunk_geomap.init_renderer = function() {
    dm3_freifunk_geomap.geomap_renderer.init()
}
