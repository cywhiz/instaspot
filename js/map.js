var pos;
var curPos;
var map;
var infowindow;
var radius;
var radiusInput;
var geocoder;
var markers = [];

function initialize() {
    map = new google.maps.Map(document.getElementById("map-canvas"));
    infowindow = new google.maps.InfoWindow();
    geocoder = new google.maps.Geocoder();

    geoLocate();
}

function geoLocate() {
    // HTML5 geolocation
    navigator.geolocation.getCurrentPosition(function(position) {
        curPos = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
        );

        geocoder.geocode(
            {
                latLng: curPos
            },
            function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        map.setZoom(15);
                        map.setCenter(curPos);

                        addMarker(
                            "img/marker.png",
                            curPos,
                            "" + results[1].formatted_address
                        );
                        document.getElementById("radius").value = 1;
                        document.getElementById("address").value =
                            results[1].formatted_address;
                        readJSON();
                    } else {
                        alert("No results found");
                    }
                } else {
                    alert("Geocoder failed due to: " + status);
                }
            }
        );
    });
}

function readJSON() {
    //var json = "http://www1.toronto.ca/City_Of_Toronto/Information_&_Technology/Open_Data/Data_Sets/Assets/Files/greenPParking.json";

    // Read JSON file and set values
    $.getJSON("greenp.json", function(json) {
        $.each(json.carparks, function(i, value) {
            var address = this.address;
            var latitude = this.lat;
            var longitude = this.lng;
            var rate = this.rate;
            var content = "<h3>" + address + "</h3>Rate: " + rate + "<br>";

            $.each(this.rate_details.periods, function(i, value) {
                content += "<u>" + this.title + "</u><br>";
                $.each(this.rates, function(i, value) {
                    content += this.when + " " + this.rate + "<br>";
                });
            });

            content += "<h4>Accepted payments</h4>";
            $.each(this.payment_methods, function(i, value) {
                content += value + "<br>";
            });

            pos = new google.maps.LatLng(latitude, longitude);

            // Distance (km) between the parking lot VS current position
            radius =
                google.maps.geometry.spherical.computeDistanceBetween(
                    pos,
                    curPos
                ) / 1000;

            radiusInput = document.getElementById("radius").value;
            if (radius <= radiusInput) {
                addMarker("img/greenp.png", pos, content);
            }

            //var k = new google.maps.LatLng(43.653226, -79.383184);
        });
    });
}

// Add marker to map
function addMarker(icon, position, content) {
    marker = new google.maps.Marker({
        map: map,
        icon: icon,
        position: position
    });

    markers.push(marker);

    google.maps.event.addListener(marker, "click", function() {
        infowindow.setContent(content);
        infowindow.open(map, this);
    });
}

// Delete all markers on map
function deleteMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }

    markers = [];
}

// Geocoder
function codeAddress() {
    deleteMarkers();
    var address = document.getElementById("address").value;
    geocoder.geocode(
        {
            address: address
        },
        function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                curPos = new google.maps.LatLng(
                    results[0].geometry.location.lat(),
                    results[0].geometry.location.lng()
                );
                map.setZoom(15);
                map.setCenter(curPos);

                addMarker("img/marker.png", curPos, "fdsfsdds");
                readJSON();
            } else {
                alert(
                    "Geocode was not successful for the following reason: " +
                        status
                );
            }
        }
    );
}

google.maps.event.addDomListener(window, "load", initialize);
