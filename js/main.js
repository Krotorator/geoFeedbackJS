"use strict";

var popup = document.querySelector("#popup");
var popupHeader = document.querySelector("#popup .popup__header span");
var popupClose = document.querySelector("#popup .popup__header button");
var popupFeedback = document.querySelector("#popup .popup__feedback");
var form = document.querySelector("#popup form");
var formName = document.querySelector("#name");
var formPlace = document.querySelector("#place");
var formComment = document.querySelector("#comment"); //попап с отзывами

var source = document.getElementById("hb-template").innerHTML;
var template = Handlebars.compile(source);
var result = document.querySelector("#result"); //карусель

var tabContainerSource = document.getElementById("carousel-template").innerHTML;
var tabContainerTemplate = Handlebars.compile(tabContainerSource);
var carousel = document.querySelector(".carousel");
var tabContainer = document.querySelector(".tab-container");
var tabLinksContainer = document.querySelector(".tab-links-container");
var markerCluster;

function initMap() {
  var map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: 47.095565,
      lng: 37.546395
    },
    zoom: 18,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    mapTypeControl: false,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT
    },
    styles: [{
      elementType: "geometry",
      stylers: [{
        color: "#f5f5f5"
      }]
    }, {
      elementType: "labels.icon",
      stylers: [{
        visibility: "off"
      }]
    }, {
      elementType: "labels.text.fill",
      stylers: [{
        color: "#616161"
      }]
    }, {
      elementType: "labels.text.stroke",
      stylers: [{
        color: "#f5f5f5"
      }]
    }, {
      featureType: "administrative.land_parcel",
      elementType: "labels.text.fill",
      stylers: [{
        color: "#bdbdbd"
      }]
    }, {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{
        color: "#eeeeee"
      }]
    }, {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{
        color: "#757575"
      }]
    }, {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{
        color: "#e5e5e5"
      }]
    }, {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{
        color: "#9e9e9e"
      }]
    }, {
      featureType: "road",
      elementType: "geometry",
      stylers: [{
        color: "#ffffff"
      }]
    }, {
      featureType: "road.arterial",
      elementType: "labels.text.fill",
      stylers: [{
        color: "#757575"
      }]
    }, {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{
        color: "#dadada"
      }]
    }, {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{
        color: "#616161"
      }]
    }, {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [{
        color: "#9e9e9e"
      }]
    }, {
      featureType: "transit.line",
      elementType: "geometry",
      stylers: [{
        color: "#e5e5e5"
      }]
    }, {
      featureType: "transit.station",
      elementType: "geometry",
      stylers: [{
        color: "#eeeeee"
      }]
    }, {
      featureType: "water",
      elementType: "geometry",
      stylers: [{
        color: "#c9c9c9"
      }]
    }, {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{
        color: "#9e9e9e"
      }]
    }]
  });
  markerCluster = new MarkerClusterer(map, [], {
    imagePath: "./img/m",
    zoomOnClick: false
  });
  renderMarkers(map);
  map.addListener("click", function (e) {
    // проверка, чтоб не открывался попап вместе с каруселью
    if (carousel.getAttribute("style").indexOf("block") != -1) {
      popup.style.display = "none";
    } else if (carousel.getAttribute("style").indexOf("block") == -1) {
      adaptiveElementPosition({
        x: e.pixel.x,
        y: e.pixel.y
      }, popup);
    }

    setAddress(e.latLng, popupHeader);
    setComment(e.latLng.toString(), map);

    if (popup.getAttribute("style").indexOf("display: block") != -1) {
      popupFeedback.innerHTML = "";
      formName.value = "";
      formPlace.value = "";
      formComment.value = "";
    }

    popupClose.addEventListener("click", function () {
      popup.style.display = "none";
      popupFeedback.innerHTML = "";
      formName.value = "";
      formPlace.value = "";
      formComment.value = "";
    });
  }); // отслеживаем клик по кластерным Маркерам

  google.maps.event.addListener(markerCluster, "clusterclick", function (e) {
    var storageArr = {
      list: []
    }; // let coordsArr = [];

    var coordsArr = new Set();
    e.markers_.forEach(function (marker) {
      // преобразуем координаты маркеров в строковый ключ
      var coords = "(".concat(marker.position.lat().toString(), ", ").concat(marker.position.lng().toString(), ")");
      coordsArr.add(coords);
    });
    var commentsAndCoords = [];
    coordsArr.forEach(function (coords) {
      var storageContext = JSON.parse(localStorage.getItem(coords));
      var obj = {
        coords: coords,
        comments: storageContext
      };
      commentsAndCoords.push(obj);
    }); /////////////////////////////////

    var forTemplate = {
      list: []
    };
    commentsAndCoords.forEach(function (obj) {
      for (var i = 0; i < obj.comments.list.length; i++) {
        obj.comments.list[i].geo = obj.coords;
        forTemplate.list.push(obj.comments.list[i]);
      }
    });
    var tabContainerSourceHtml = tabContainerTemplate(forTemplate);
    tabContainer.innerHTML = tabContainerSourceHtml; // проверяем, есть ли ссылки в каруселе, если есть - удаляем.

    var currentLinks = document.querySelector(".tab-links-container");

    if (currentLinks.innerHTML != "") {
      currentLinks.innerHTML = "";
    } // добавляем новые ссылки


    addTabLink(forTemplate.list, tabLinksContainer, carousel); // получаем табы, которые были добавлены

    var tabs = document.querySelectorAll(".tab"); // показываем первый таб в списке загруженных

    tabs[0].classList.add("tab__shown"); // делаем карусель видимой

    carousel.style.display = "block";
    carousel.style.left = "50%";
    carousel.style.top = "50%"; // устанавливаем id каждому табу

    var j = 0;
    tabs.forEach(function (tab, i) {
      var attrVal = i + 1;
      tab.setAttribute("id", "tab" + attrVal); // получаем элемент ссылку для адреса в теле таба

      var addressLink = tab.querySelector(".tab a"); // преобразуем строковые координаты в обьект для геокода

      var coords = addressLink.innerText.slice(1, -1).split(",");
      var myLatLang = {
        lat: parseFloat(coords[0]),
        lng: parseFloat(coords[1])
      }; // делаем реверсивный геокод и записываем в ссылку получившийся строковый адрес

      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({
        location: myLatLang
      }, function (results, status) {
        if (status == "OK") {
          addressLink.innerText = results[0].formatted_address;
        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
      }); // открытие попапа по клику на сслыку с адресом

      addressLink.addEventListener("click", function (e) {
        popup.style.display = "block";
        adaptiveElementPosition(e, popup); // преобразуем координаты в строковый ключ, берем по нему данные из localStorage, скармливаем в рендер и выводим в попап

        var renderCoords = "(".concat(coords[0].toString(), ",").concat(coords[1].toString(), ")");
        var forSetAdrCoords = renderCoords.slice(1, -1).split(",");
        setAddress({
          lat: parseFloat(forSetAdrCoords[0]),
          lng: parseFloat(forSetAdrCoords[1])
        }, popupHeader);
        renderPopupOnClick(renderCoords, map);
        carousel.style.display = "none";
      });
      j++;
    }); // вешаем событие на ссылки для переключения между табами

    carousel.addEventListener("click", function (e) {
      if (e.target.classList.contains("tab__link")) {
        document.querySelectorAll(".tab__link").forEach(function (tabLink) {
          return tabLink.classList.remove("tab__link-active");
        });
        e.target.classList.add("tab__link-active");
        tabs.forEach(function (tab) {
          if (tab != e.target) {
            tab.classList.remove("tab__shown");
          }

          if (e.target.getAttribute("href").slice(1) == tab.getAttribute("id")) {
            if (!tab.classList.contains("tab__shown")) {
              tab.classList.add("tab__shown");
            }
          }
        });
      } // стрелка вправо


      if (e.target.tagName == "I" && e.target.classList.contains("fa-chevron-right")) {
        var currentTab;

        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i].classList.contains("tab__shown")) {
            currentTab = i;
          }
        }

        if (currentTab + 1 > tabs.length - 1) {
          currentTab = 0;
          tabs[tabs.length - 1].classList.remove("tab__shown");
          tabs[currentTab].classList.add("tab__shown");
        } else {
          tabs[currentTab].classList.remove("tab__shown");
          tabs[currentTab + 1].classList.add("tab__shown");
        }
      } // стрелка влево


      if (e.target.tagName == "I" && e.target.classList.contains("fa-chevron-left")) {
        var _currentTab;

        for (var _i = 0; _i < tabs.length; _i++) {
          if (tabs[_i].classList.contains("tab__shown")) {
            _currentTab = _i;
          }
        }

        if (_currentTab - 1 < 0) {
          _currentTab = tabs.length - 1;
          tabs[0].classList.remove("tab__shown");

          tabs[_currentTab].classList.add("tab__shown");
        } else {
          tabs[_currentTab].classList.remove("tab__shown");

          tabs[_currentTab - 1].classList.add("tab__shown");
        }
      }
    });
  });
} // закрываем карусель по клику


document.querySelector(".tab-close").addEventListener("click", function () {
  return carousel.style.display = "none";
}); // преобразовать координаты в адрес и установить в шапку попапа

function setAddress(LatLng, where) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    location: LatLng
  }, function (results, status) {
    if (status == "OK") {
      where.textContent = results[0].formatted_address;
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

function setMarker(latLng, map) {
  var marker = new google.maps.Marker({
    position: latLng,
    map: map
  });
  marker.addListener("click", function (e) {
    // преобразуем координаты маркеров в строковый ключ
    // let coords = `(${e.latLng.lat().toString()}, ${e.latLng.lng().toString()})`;
    renderPopupOnClick(e.latLng, map, marker);
    setAddress(e.latLng, popupHeader);
  });
  markerCluster.addMarker(marker);
  return marker;
}

function setComment(coords, map, data) {
  var obj = {
    list: []
  }; // если в попапе уже есть отзывы, если нет - передаем пустой обьект

  var context = data || obj;

  form.onsubmit = function (e) {
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
        var markerCoords = coords.slice(1, -1).split(",");
        var myLatLang = {
          lat: parseFloat(markerCoords[0]),
          lng: parseFloat(markerCoords[1])
        };
        setMarker(myLatLang, map);
      } else {
        var strKeyCoords = "(" + coords.lat + ", " + coords.lng + ")";
        localStorage.setItem(strKeyCoords, [JSON.stringify(context)]);
        setMarker(coords, map);
      }
    }
  };
}

function renderMarkers(map) {
  var keys = Object.keys(localStorage);

  if (keys) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var _loop = function _loop() {
        var key = _step.value;
        // создаем кластеры по количеству комментов в каждом маркере
        var coords = key.slice(1, -1).split(",");
        var myLatLang = {
          lat: parseFloat(coords[0]),
          lng: parseFloat(coords[1])
        };
        var store = JSON.parse(localStorage.getItem(key));
        store.list.forEach(function () {
          setMarker(myLatLang, map);
        });
      };

      for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
}

function renderPopupOnClick(coords, map) {
  var keys = Object.keys(localStorage);

  if (keys) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var key = _step2.value;

        if (key == coords) {
          // устанавливаем правильные координаты попапа после проверки цели клика, чтоб не срабатывало событие на клике
          // по полям самого попапа и он не перерисовывался при взаимодействии
          document.addEventListener("click", function (e) {
            if (e.target.tagName == "AREA") {
              adaptiveElementPosition(e, popup);
            }
          }); //ренедрим попап и данные из локал сторедж

          popup.style.display = "block";
          var storageContext = JSON.parse(localStorage.getItem(key));
          var html = template(storageContext);
          popupFeedback.innerHTML = html; // пробрасываем координаты в в функцию для дальнейшего геокодинга и установки адреса в шапку попапа

          var _coords = key.slice(1, -1).split(",");

          setComment({
            lat: parseFloat(_coords[0]),
            lng: parseFloat(_coords[1])
          }, map, storageContext);
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }

  popupClose.addEventListener("click", function () {
    popup.style.display = "none";
    formName.value = "";
    formPlace.value = "";
    formComment.value = "";
  });
} // добавляем ссылки на табы, соответственно кол-ву элументов в массиве адресов


function addTabLink(arr, what, where) {
  where.append(tabLinksContainer);

  for (var i = 0; i < arr.length; i++) {
    var a = document.createElement("a");
    a.classList.add("tab__link");
    var attrVal = i + 1;
    a.setAttribute("href", "#tab" + attrVal);
    a.innerText = attrVal;
    what.append(a);
  }
}

function adaptiveElementPosition(eventCoords, element) {
  var elemWidth = element.getBoundingClientRect().width;
  var elemHeight = element.getBoundingClientRect().height;
  var coordsX = eventCoords.x;
  var coordsY = eventCoords.y; // т.к. размер попапа при до первой его проорисовки неизвестен, то выполняем проверку

  if (elemWidth && elemHeight) {
    // если размер попапа известен - производим фильтрацию
    var elemPositionRight = elemWidth + coordsX;
    var elemPositionTop = elemHeight + coordsY;
    var diffX = elemPositionRight - window.innerWidth;
    var diffY = elemPositionTop - window.innerHeight;
    element.style.transform = "translate(0, 0)"; // фильтруем позицию попапа, при которой он выходит за границы экрана

    if (elemPositionRight > window.innerWidth) {
      element.style.left = coordsX - diffX + "px";
    } else {
      element.style.left = coordsX + "px";
    }

    if (elemPositionTop > window.innerHeight) {
      element.style.top = coordsY - diffY + "px";
    } else {
      element.style.top = coordsY + "px";
    }

    popup.style.display = "block";
  } else {
    // если размер попапа неизвестен - то просто рендерим его по центру экрана,
    // чтобы избежать отрисовки его за пределами window
    element.style.top = "50%";
    element.style.left = "50%";
    element.style.transform = "translate(-50%, -50%)";
    popup.style.display = "block";
  }
}
/* //= _scripts1.js */