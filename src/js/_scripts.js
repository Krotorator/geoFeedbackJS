let popup = document.querySelector("#popup");
let popupHeader = document.querySelector("#popup .popup__header span");
let popupClose = document.querySelector("#popup .popup__header button");
let popupFeedback = document.querySelector("#popup .popup__feedback");
let form = document.querySelector("#popup form");
let formName = document.querySelector("#name");
let formPlace = document.querySelector("#place");
let formComment = document.querySelector("#comment");
//попап с отзывами
let source = document.getElementById("hb-template").innerHTML;
let template = Handlebars.compile(source);
let result = document.querySelector("#result");
//карусель
let tabContainerSource = document.getElementById("carousel-template").innerHTML;
let tabContainerTemplate = Handlebars.compile(tabContainerSource);
const carousel = document.querySelector(".carousel");

var tabContainer = document.querySelector(".tab-container");
var tabLinksContainer = document.querySelector(".tab-links-container");

var markerCluster;

function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 50.450938, lng: 30.522505 },
        zoom: 10,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
        mapTypeControl: false,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT
        },
        styles: [
            {
                elementType: "geometry",
                stylers: [
                    {
                        color: "#f5f5f5"
                    }
                ]
            },
            {
                elementType: "labels.icon",
                stylers: [
                    {
                        visibility: "off"
                    }
                ]
            },
            {
                elementType: "labels.text.fill",
                stylers: [
                    {
                        color: "#616161"
                    }
                ]
            },
            {
                elementType: "labels.text.stroke",
                stylers: [
                    {
                        color: "#f5f5f5"
                    }
                ]
            },
            {
                featureType: "administrative.land_parcel",
                elementType: "labels.text.fill",
                stylers: [
                    {
                        color: "#bdbdbd"
                    }
                ]
            },
            {
                featureType: "poi",
                elementType: "geometry",
                stylers: [
                    {
                        color: "#eeeeee"
                    }
                ]
            },
            {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [
                    {
                        color: "#757575"
                    }
                ]
            },
            {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [
                    {
                        color: "#e5e5e5"
                    }
                ]
            },
            {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [
                    {
                        color: "#9e9e9e"
                    }
                ]
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [
                    {
                        color: "#ffffff"
                    }
                ]
            },
            {
                featureType: "road.arterial",
                elementType: "labels.text.fill",
                stylers: [
                    {
                        color: "#757575"
                    }
                ]
            },
            {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [
                    {
                        color: "#dadada"
                    }
                ]
            },
            {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [
                    {
                        color: "#616161"
                    }
                ]
            },
            {
                featureType: "road.local",
                elementType: "labels.text.fill",
                stylers: [
                    {
                        color: "#9e9e9e"
                    }
                ]
            },
            {
                featureType: "transit.line",
                elementType: "geometry",
                stylers: [
                    {
                        color: "#e5e5e5"
                    }
                ]
            },
            {
                featureType: "transit.station",
                elementType: "geometry",
                stylers: [
                    {
                        color: "#eeeeee"
                    }
                ]
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [
                    {
                        color: "#c9c9c9"
                    }
                ]
            },
            {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [
                    {
                        color: "#9e9e9e"
                    }
                ]
            }
        ]
    });

    markerCluster = new MarkerClusterer(map, [], {
        imagePath: "./img/m",
        zoomOnClick: false
    });

    renderMarkers(map);

    // фильтруем клик по элементу у которого есть свойство z-ind(в нашем слчае это карта) и тогда рендерим попап.
    //  таким образом клик по кластеру покажет только карусель. ужасный способ!
    document.addEventListener("click", e => {
        let style = e.target.getAttribute("style");

        if (e.target.hasAttribute("style") && style.indexOf("z-index") != -1) {
            popup.style.display = "block";

            adaptiveElementPosition(e, popup);

            if (popup.getAttribute("style").indexOf("display: block") != -1) {
                popupFeedback.innerHTML = "";
                formName.value = "";
                formPlace.value = "";
                formComment.value = "";
            }
        }
    });

    map.addListener("click", function(e) {
        setAddress(e.latLng, popupHeader);

        setComment(e.latLng.toString(), map);

        popupClose.addEventListener("click", function() {
            popup.style.display = "none";
            popupFeedback.innerHTML = "";
            formName.value = "";
            formPlace.value = "";
            formComment.value = "";
        });
    });
    // отслеживаем клик по кластерным Маркерам
    google.maps.event.addListener(markerCluster, "clusterclick", e => {
        popup.style.display = "none";

        let storageArr = {
            list: []
        };
        e.markers_.forEach(marker => {
            // преобразуем координаты маркеров в строковый ключ
            let coords = `(${marker.position
                .lat()
                .toString()}, ${marker.position.lng().toString()})`;

            markers1.push(marker.position);
            // получаем данные из хранилища по ключам и преобразуем в обьекты
            let storageContext = JSON.parse(localStorage.getItem(coords));

            let obj = {
                coords: coords,
                comments: []
            };
            // // пушим сформированный обьект в массив контекста HBS
            storageContext.list.forEach(comment => {
                storageArr.list.push(comment);

                obj.comments.push([JSON.stringify(comment)]);
            });
            // проверяем соответствия отзыва адресу и добавляем в обьект комментария поле geo с координатами
            storageArr.list.forEach(function(item) {
                for (const key in obj) {
                    if (key == "comments") {
                        obj[key].forEach(comment => {
                            if (comment == JSON.stringify(item)) {
                                item.geo = obj.coords;
                            }
                        });
                    }
                }
            });

            // рендерим комменты в DOM
            let tabContainerSourceHtml = tabContainerTemplate(storageArr);

            tabContainer.innerHTML = tabContainerSourceHtml;
        });
        // проверяем, есть ли ссылки в каруселе, если есть - удаляем.
        let currentLinks = document.querySelector(".tab-links-container");
        if (currentLinks.innerHTML != "") {
            currentLinks.innerHTML = "";
        }

        // добавляем новые ссылки
        addTabLink(storageArr.list, tabLinksContainer, carousel);

        // получаем табы, которые были добавлены
        const tabs = document.querySelectorAll(".tab");

        // показываем первый таб в списке загруженных
        tabs[0].classList.add("tab__shown");

        // делаем карусель видимой
        carousel.style.display = "block";
        carousel.style.left = "50%";
        carousel.style.top = "50%";

        // устанавливаем id каждому табу
        let j = 0;
        tabs.forEach(function(tab, i) {
            let attrVal = i + 1;
            tab.setAttribute("id", "tab" + attrVal);

            // получаем элемент ссылку для адреса в теле таба
            let addressLink = tab.querySelector(".tab a");

            // преобразуем строковые координаты в обьект для геокода
            let coords = addressLink.innerText.slice(1, -1).split(",");
            let myLatLang = { lat: parseFloat(coords[0]), lng: parseFloat(coords[1]) };

            // делаем реверсивный геокод и записываем в ссылку получившийся строковый адрес
            let geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: myLatLang }, function(results, status) {
                if (status == "OK") {
                    addressLink.innerText = results[0].formatted_address;
                } else {
                    alert("Geocode was not successful for the following reason: " + status);
                }
            });

            // открытие попапа по клику на сслыку с адресом
            addressLink.addEventListener("click", function(e) {
                popup.style.display = "block";
                adaptiveElementPosition(e, popup);
                // преобразуем координаты в строковый ключ, берем по нему данные из localStorage, скармливаем в рендер и выводим в попап
                let renderCoords = `(${coords[0].toString()},${coords[1].toString()})`;

                let forSetAdrCoords = renderCoords.slice(1, -1).split(",");
                setAddress(
                    { lat: parseFloat(forSetAdrCoords[0]), lng: parseFloat(forSetAdrCoords[1]) },
                    popupHeader
                );
                renderPopupOnClick(renderCoords, map);

                carousel.style.display = "none";
            });

            j++;
        });

        // вешаем событие на ссылки для переключения между табами
        carousel.addEventListener("click", e => {
            if (e.target.classList.contains("tab__link")) {
                tabs.forEach(function(tab, i) {
                    if (tab != e.target) {
                        tab.classList.remove("tab__shown");
                    }
                    if (e.target.getAttribute("href").slice(1) == tab.getAttribute("id")) {
                        if (!tab.classList.contains("tab__shown")) {
                            tab.classList.add("tab__shown");
                        }
                    }
                });
            }
        });
    });
}

// закрываем карусель по клику
document
    .querySelector(".tab-close")
    .addEventListener("click", () => (carousel.style.display = "none"));

// преобразовать координаты в адрес и установить в шапку попапа
function setAddress(LatLng, where) {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: LatLng }, function(results, status) {
        if (status == "OK") {
            where.textContent = results[0].formatted_address;
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

function setMarker(latLng, map) {
    let marker = new google.maps.Marker({
        position: latLng,
        map: map
    });

    marker.addListener("click", function(e) {
        // преобразуем координаты маркеров в строковый ключ
        // let coords = `(${e.latLng.lat().toString()}, ${e.latLng.lng().toString()})`;

        renderPopupOnClick(e.latLng, map, marker);
        setAddress(e.latLng, popupHeader);
    });

    markerCluster.addMarker(marker);
    return marker;
}

function setComment(coords, map, data) {
    let obj = { list: [] };
    // если в попапе уже есть отзывы, если нет - передаем пустой обьект
    let context = data || obj;

    form.onsubmit = e => {
        e.preventDefault();
        if (formName.value && formPlace.value && formComment.value) {
            var obj = {
                name: formName.value,
                place: formPlace.value,
                comment: formComment.value
            };
            context.list.push(obj);
            var html = template(context);
            popupFeedback.innerHTML = html;

            formName.value = "";
            formPlace.value = "";
            formComment.value = "";

            if (typeof coords == "string") {
                localStorage.setItem(coords, [JSON.stringify(context)]);

                let markerCoords = coords.slice(1, -1).split(",");
                let myLatLang = {
                    lat: parseFloat(markerCoords[0]),
                    lng: parseFloat(markerCoords[1])
                };
                setMarker(myLatLang, map);
            } else {
                let strKeyCoords = "(" + coords.lat + ", " + coords.lng + ")";
                localStorage.setItem(strKeyCoords, [JSON.stringify(context)]);
                setMarker(coords, map);
            }
        }
    };
}

function renderMarkers(map) {
    let keys = Object.keys(localStorage);
    if (keys) {
        for (let key of keys) {
            let coords = key.slice(1, -1).split(",");
            let myLatLang = { lat: parseFloat(coords[0]), lng: parseFloat(coords[1]) };
            setMarker(myLatLang, map);
        }
    }
}

function renderPopupOnClick(coords, map) {
    let keys = Object.keys(localStorage);
    if (keys) {
        for (let key of keys) {
            if (key == coords) {
                // устанавливаем правильные координаты попапа после проверки цели клика, чтоб не срабатывало событие на клике
                // по полям самого попапа и он не перерисовывался при взаимодействии
                document.addEventListener("click", e => {
                    if (e.target.tagName == "AREA") {
                        adaptiveElementPosition(e, popup);
                    }
                });
                //ренедрим попап и данные из локал сторедж
                popup.style.display = "block";
                let storageContext = JSON.parse(localStorage.getItem(key));
                var html = template(storageContext);
                popupFeedback.innerHTML = html;

                // пробрасываем координаты в в функцию для дальнейшего геокодинга и установки адреса в шапку попапа
                let coords = key.slice(1, -1).split(",");

                setComment(
                    { lat: parseFloat(coords[0]), lng: parseFloat(coords[1]) },
                    map,
                    storageContext
                );
            }
        }
    }

    popupClose.addEventListener("click", function() {
        popup.style.display = "none";
        formName.value = "";
        formPlace.value = "";
        formComment.value = "";
    });
}

// добавляем ссылки на табы, соответственно кол-ву элументов в массиве адресов
function addTabLink(arr, what, where) {
    where.append(tabLinksContainer);
    for (let i = 0; i < arr.length; i++) {
        let a = document.createElement("a");
        a.classList.add("tab__link");
        let attrVal = i + 1;
        a.setAttribute("href", "#tab" + attrVal);
        a.innerText = attrVal;
        what.append(a);
    }
}

function adaptiveElementPosition(ev, element) {
    let elemPositionRight = element.getBoundingClientRect().width + ev.clientX;
    let elemPositionTop = element.getBoundingClientRect().height + ev.clientY;
    let diffX = elemPositionRight - window.innerWidth;
    let diffY = elemPositionTop - window.innerHeight;
    // фильтруем позицию попапа, при которой он выходит за границы экрана
    if (elemPositionRight > window.innerWidth) {
        element.style.left = ev.clientX - diffX + "px";
    } else {
        element.style.left = ev.clientX + "px";
    }
    if (elemPositionTop > window.innerHeight) {
        element.style.top = ev.clientY - diffY + "px";
    } else {
        element.style.top = ev.clientY + "px";
    }
    popup.style.display = "block";
}
