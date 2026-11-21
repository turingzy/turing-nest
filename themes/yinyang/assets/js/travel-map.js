// 旅行地图
document.addEventListener("DOMContentLoaded", function() {
    var data = JSON.parse(document.getElementById('travel-map-data').textContent);
    var spots = data.spots;
    if (!Array.isArray(spots) || spots.length === 0) return;

    // 扁平风格：不用瓦片底图，直接绘制省份色块
    var map = L.map('travel-map', {
        minZoom: 3,
        maxZoom: 8,
        zoomControl: false,
        zoomSnap: 0.25,
        attributionControl: false
    });

    var initialView = { center: [37, 105], zoom: 3.75 };
    map.setView(initialView.center, initialView.zoom);

    L.control.attribution({ prefix: false })
        .addAttribution('边界数据 &copy; <a href="http://datav.aliyun.com/portal/school/atlas/area_selector" target="_blank" rel="noopener">DataV.GeoAtlas</a>')
        .addTo(map);

    function currentTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    var REGION_STYLE = {
        light: {
            base:    { fillColor: '#e8e8e8', fillOpacity: 1, color: '#ffffff', weight: 1, opacity: 1 },
            visited: { fillColor: '#86efac', fillOpacity: 1, color: '#ffffff', weight: 1, opacity: 1 }
        },
        dark: {
            base:    { fillColor: '#2e2e2e', fillOpacity: 1, color: '#1a1a1a', weight: 1, opacity: 1 },
            visited: { fillColor: '#166534', fillOpacity: 1, color: '#1a1a1a', weight: 1, opacity: 1 }
        }
    };

    var visitedProvinces = {};
    spots.forEach(function(spot) {
        if (spot.adcode) {
            visitedProvinces[Math.floor(spot.adcode / 10000) * 10000] = true;
        }
    });

    var regionLayer = null;

    function styleFor(feature) {
        var theme = REGION_STYLE[currentTheme()];
        return visitedProvinces[feature.properties.adcode] ? theme.visited : theme.base;
    }

    var chinaGeo = data.regions;
    if (chinaGeo) {
        regionLayer = L.geoJSON(chinaGeo, {
            style: styleFor,
            onEachFeature: function(feature, layer) {
                if (feature.properties && feature.properties.name) {
                    layer.bindTooltip(feature.properties.name, {
                        sticky: true,
                        direction: 'top',
                        className: 'travel-region-tip'
                    });
                }
                layer.on('click', function() {
                    map.fitBounds(layer.getBounds().pad(0.15));
                });
            }
        }).addTo(map);
        regionLayer.bringToBack();
    }

    new MutationObserver(function() {
        if (regionLayer) regionLayer.setStyle(styleFor);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    var HomeControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'home-button');
            container.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
            container.title = '回到初始位置';
            L.DomEvent.on(container, 'click', function() {
                map.setView(initialView.center, initialView.zoom);
            });
            return container;
        }
    });
    map.addControl(new HomeControl());
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // 点位：浅绿圆环，默认不显示城市名，点击后显示
    var markerGroup = L.featureGroup();

    spots.forEach(function(spot) {
        if (typeof spot.lat !== 'number' || typeof spot.lon !== 'number') return;

        var marker = L.circleMarker([spot.lat, spot.lon], {
            radius: 4,
            fillColor: '#ffffff',
            color: '#000000',
            weight: 2,
            opacity: 1,
            fillOpacity: 1
        });

        marker.bindTooltip(spot.name, {
            permanent: false,
            direction: 'top',
            offset: L.point(0, -6),
            className: 'travel-label'
        });

        marker.on('click', function(e) {
            L.DomEvent.stopPropagation(e);
            if (this.isTooltipOpen()) {
                this.closeTooltip();
            } else {
                this.openTooltip();
            }
        });

        markerGroup.addLayer(marker);
    });

    map.addLayer(markerGroup);
});
