function createMap(earthquakeLayer, faultlineLayer) {
    // Define map layers
    var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        accessToken: API_KEY
    });

    var graymap = L.tileLayer.grayscale("https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        accessToken: API_KEY
    });

    var baseMaps = {
        "Outdoor": outdoormap,
        "Grayscale": graymap,
    };

    var overlayMaps = {
        "Earthquake": earthquakeLayer,
        "Fault Line": faultlineLayer
    };

    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 4,
        layers: [outdoormap, earthquakeLayer]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    return myMap;
}

// legend
function addLegend(myMap) {
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend"),
            magnitude = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML += labels.push("<h4>Magnitude</h4>");

        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
                labels.push('<i style="background:' + getColor(magnitude[i]) + '"></i> ' +
                    magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+'));
        }

        div.innerHTML = labels.join('');

        return div;
    };

    // Adding legend to the map
    legend.addTo(myMap);
}

// Get color according to magnitude
function getColor(magnitude) {
    if (magnitude >= 5) {
        return '#ff3333';
    }
    else if (magnitude >= 4) {
        return '#ff9633';
    }
    else if (magnitude >= 3) {
        return '#feff33';
    }
    else if (magnitude >= 2) {
        return '#9fff33';
    }
    else if (magnitude >= 1) {
        return '#33ff45';
    }
    else {
        return '#33ffaf';
    }
}

// Hightlight when mouse hover over
function highlightFeature(e) {
    var layer = e.target;

    if (layer._radius) {
        layer.setStyle({ // highlight the feature
            "color": 'red',
            "weight": 3,
            "fillOpacity": 0.6
        });
    }

    else {
        layer.setStyle({ // highlight the feature
            "color": 'red',
            "weight": 5,
            "fillOpacity": 0.6
        });
    }
}

// Reset when mouse hover out
function resetFeature(e) {
    var layer = e.target;

    if (layer._radius) {
        layer.setStyle({ // highlight the feature
            "color": "#000",
            "weight": 1,
            "fillOpacity": 0.8
        });
    }

    else {
        layer.setStyle({ // highlight the feature
            "color": "#ff7800",
            "weight": 4,
            "fillOpacity": 0.9
        });
    }
}

var earthquakeLayer = L.layerGroup();

var earthquake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(earthquake_url, function (data) {
    L.geoJSON(data, {
        pointToLayer: function (feature) {
            var mag = feature.properties.mag;
            var coord = feature.geometry.coordinates.slice(0, 2);
            var lat = coord[1];
            var lng = coord[0];

            return L.circleMarker([lat, lng], {
                radius: mag * 4,
                fillColor: getColor(mag),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).bindPopup("<h4> " + feature.properties.place + " </h4> <hr> <h4>Magnitude: " + mag + "</h4> <h4>Latitude: " + lat + "</h4> <h4>Longitude: " + lng + "</h4>");
        },

        onEachFeature: function (feature, layer) {
            layer.on({
                "mouseover": highlightFeature,
                "mouseout": resetFeature
            });

            earthquakeLayer.addLayer(layer);
        }
    });
});

// Create layer for fault lines
var faultlineLayer = L.layerGroup();

var fault_line_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

d3.json(fault_line_url, function (data) {
    var mystyle = {
        "color": "#ff7800",
        "weight": 4,
        "opacity": 0.9
    };

    L.geoJSON(data, {
        style: mystyle,
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3><u>plate name</u>: " + feature.properties.Name + "</h3>");
            layer.on({
                "mouseover": highlightFeature,
                "mouseout": resetFeature
            });
            faultlineLayer.addLayer(layer);
        }
    });
});

var myMap = createMap(earthquakeLayer, faultlineLayer);

// Add legend to map
addLegend(myMap);