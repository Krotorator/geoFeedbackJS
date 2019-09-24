let popup = document.querySelector("#popup");
let popupClose = document.querySelector("#popup .popup__header button");
let popupFeedback = document.querySelector("#popup .popup__feedback");

let source = document.getElementById("hb-template").innerHTML;
let template = Handlebars.compile(source);
let result = document.querySelector("#result");

function initMap() {
    let geocoder = new google.maps.Geocoder();

    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 50.450938, lng: 30.522505 },
        zoom: 10
    });

    map.addListener("click", function(e) {
        // setAddress(e.latLng);
        // closePopupAndAddToStorage(e.latLng);
        // setComment(form, e.latLng, map);
        var html = template(context);

        result.innerHTML = html;
        geocoder.geocode({ location: e.latLng }, function(results, res) {
            let popupHeader = document.querySelector("#popup .popup__header span");
            popupHeader.innerText = results[0].formatted_address;
        });

        setComment(map);

        var context = {
            address: ""
        };
    });
}

function setComment(coords, map) {
    // let counter = 0;
    var form = document.querySelector("#popup form");
    var loadBtn = document.querySelector("#popup form button");
    let formName = document.querySelector("#name");
    let formPlace = document.querySelector("#place");
    let formComment = document.querySelector("#comment");

    loadBtn.addEventListener("click", e => {
        e.preventDefault();
        // counter++;
        // console.log(typeof counter);

        if (formName.value && formPlace.value && formComment.value) {
            var context = {
                comment: formName.value + formPlace.value + formComment.value
            };
            var html = template(context);
            result.innerHTML = html;
        }
        // setMarker(coords, map, counter);
    });
}

function setMarker(latLng, map, counter) {
    let marker = new google.maps.Marker({
        position: latLng,
        label: counter.toString(),
        map: map
    });
    marker.addListener("click", function(e) {
        let coords = `(${e.latLng.lat().toString()}, ${e.latLng.lng().toString()})`;
        renderPopupOnClick(coords, map, marker);
    });
    marker.setMap(map);
}
