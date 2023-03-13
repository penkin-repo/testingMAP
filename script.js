import pointList from "./pointList.js";

// start class 
// data туда передается массив с точками
// map туда передается id блока с картой. По умолчанию он map

class createMap {
  constructor(data, id = "map") {
    this.id = id;
    this.data = data;
  }
  render() {
    let id = this.id;
    let data = this.data;

    //  start Формирование карты
    ymaps.ready(function () {
      // start

      var LAYER_NAME = "user#layer",
        MAP_TYPE_NAME = "user#customMap",
        // Директория с тайлами.
        TILES_PATH = "images/tiles",
        /* Для того чтобы вычислить координаты левого нижнего и правого верхнего углов прямоугольной координатной
         * области, нам необходимо знать максимальный зум, ширину и высоту изображения в пикселях на максимальном зуме.
         */
        MAX_ZOOM = 6,
        FIRST_ZOOM = 0,
        FIRST_ZOOM = 3,
        PIC_WIDTH = 8858,
        PIC_HEIGHT = 8858;

      /**
       * Конструктор, создающий собственный слой.
       */
      var Layer = function () {
        var layer = new ymaps.Layer(TILES_PATH + "/%z/tile-%x-%y.jpg", {
          // Если есть необходимость показать собственное изображение в местах неподгрузившихся тайлов,
          // раскомментируйте эту строчку и укажите ссылку на изображение.
          // notFoundTile: 'url'
        });
        // Указываем доступный диапазон масштабов для данного слоя.
        layer.getZoomRange = function () {
          return ymaps.vow.resolve([0, MAX_ZOOM]);
        };
        // Добавляем свои копирайты.
        layer.getCopyrights = function () {
          return ymaps.vow.resolve("©");
        };
        return layer;
      };
      // Добавляем в хранилище слоев свой конструктор.
      ymaps.layer.storage.add(LAYER_NAME, Layer);

      /**
       * Создадим новый тип карты.
       * MAP_TYPE_NAME - имя нового типа.
       * LAYER_NAME - ключ в хранилище слоев или функция конструктор.
       */
      var mapType = new ymaps.MapType(MAP_TYPE_NAME, [LAYER_NAME]);
      // Сохраняем тип в хранилище типов.
      ymaps.mapType.storage.add(MAP_TYPE_NAME, mapType);

      // Вычисляем размер всех тайлов на максимальном зуме.
      var worldSize = Math.pow(2, MAX_ZOOM) * 256,
        /**
         * Создаем карту, указав свой новый тип карты.
         */
        map = new ymaps.Map(
          // "map",
          // NEW для класса
          id,
          {
            center: [0, 0],
            zoom: FIRST_ZOOM,
            controls: ["zoomControl"],
            controls: [],
            type: MAP_TYPE_NAME,
          },
          {
            // Задаем в качестве проекции Декартову. При данном расчёте центр изображения будет лежать в координатах [0, 0].
            projection: new ymaps.projection.Cartesian(
              [
                [PIC_HEIGHT / 2 - worldSize, -PIC_WIDTH / 2],
                [PIC_HEIGHT / 2, worldSize - PIC_WIDTH / 2],
              ],
              [false, false]
            ),
            // Устанавливаем область просмотра карты так, чтобы пользователь не смог выйти за пределы изображения.
            restrictMapArea: [
              [-PIC_HEIGHT / 2, -PIC_WIDTH / 2],
              [PIC_HEIGHT / 2, PIC_WIDTH / 2],
            ],
          }
        );

      ymaps.ready(["Panel"]).then(function () {
        // Создадим и добавим панель на карту.
        var panel = new ymaps.Panel();
        map.controls.add(panel, {
          float: "left",
        });
        // Создадим коллекцию геообъектов.
        var collection = new ymaps.GeoObjectCollection(null, {
          // Запретим появление балуна.
          hasBalloon: false,
          iconLayout: "default#image",
          iconImageHref: "img/icon.svg",
          iconImageSize: [49, 59],
          iconImageOffset: [-15, -44],
        });
        // Добавим геообъекты в коллекцию.

        // NEW новая работа с циклом
        data.forEach((element) => {
          collection.add(
            new ymaps.Placemark(element.coordinates, {
              balloonContent: `<div class="map-image"><img src="${element.image}"></div>
             <h2>${element.head}</h2>
             <p>${element.content}</p>
        
             <div class="map-button-container">
               <a class="button-gen map-button" href="${element.link}">
               <span>Подробнее</span>
               </a>
               ${element.icon3d ? "<img src=\"img/3d.svg\" alt=\"3d-icon\">" : ""}
             </div>
             `,
            })
          );
        });

        // Добавим коллекцию на карту.
        map.geoObjects.add(collection);
        // Подпишемся на событие клика по коллекции.
        collection.events.add("click", function (e) {
          // Получим ссылку на геообъект, по которому кликнул пользователь.
          var target = e.get("target");
          // Зададим контент боковой панели.
          panel.setContent(target.properties.get("balloonContent"));
          panel._onClose;
          // Переместим центр карты по координатам метки с учётом заданных отступов.
          map.panTo(target.geometry.getCoordinates(), { useMapMargin: true });
        });
        collection.events.add("click", function (e) {
          // Ссылку на объект, вызвавший событие,
          // можно получить из поля 'target'
          document
            .querySelectorAll(".ymaps-2-1-79-image")
            .forEach((element) => {
              element.style.backgroundImage = "url(img/icon.svg)";
              element.style.backgroundSize = "49px 59px";
              element.style.width = "49px";
              element.style.height = "59px";
              element.style.top = "-44px";
              element.style.left = "-15px";
            });

          e.get("target").options.set("iconImageHref", "img/icon2.svg");
          e.get("target").options.set("iconImageSize", [89, 99]);
          e.get("target").options.set("iconImageOffset", [-35, -64]);
        });

        collection.events.add("mouseenter", function (e) {
          // Ссылку на объект, вызвавший событие,
          // можно получить из поля 'target'
          if (e.get("target").options.get("iconImageHref") === "img/icon.svg") {
            e.get("target").options.set("iconImageHref", "img/icon-a.svg");
          }
        });

        collection.events.add("mouseleave", function (e) {
          // Ссылку на объект, вызвавший событие,
          // можно получить из поля 'target'
          if (
            e.get("target").options.get("iconImageHref") === "img/icon-a.svg"
          ) {
            e.get("target").options.set("iconImageHref", "img/icon.svg");
          }
        });
      });

      // end
    });
    // end Формирование карты
    // start panel script
    // Пример реализации боковой панели на основе наследования от collection.Item.
    // Боковая панель отображает информацию, которую мы ей передали.
    ymaps.modules.define(
      "Panel",
      ["util.augment", "collection.Item"],
      function (provide, augment, item) {
        // Создаем собственный класс.
        var Panel = function (options) {
          Panel.superclass.constructor.call(this, options);
        };

        // И наследуем его от collection.Item.
        augment(Panel, item, {
          onAddToMap: function (map) {
            Panel.superclass.onAddToMap.call(this, map);
            this.getParent()
              .getChildElement(this)
              .then(this._onGetChildElement, this);
            // Добавим отступы на карту.
            // Отступы могут учитываться при установке текущей видимой области карты,
            // чтобы добиться наилучшего отображения данных на карте.
            map.margin.addArea({
              top: 0,
              left: 0,
              width: "250px",
              height: "100%",
            });
          },

          onRemoveFromMap: function (oldMap) {
            if (this._$control) {
              this._$control.remove();
            }
            Panel.superclass.onRemoveFromMap.call(this, oldMap);
          },

          _onGetChildElement: function (parentDomContainer) {
            // Создаем HTML-элемент с текстом.
            // По-умолчанию HTML-элемент скрыт.
            this._$control = $(
              '<div class="customControl"><div class="content"></div><div class="closeButton"></div></div>'
            ).appendTo(parentDomContainer);
            this._$content = $(".content");
            // При клике по крестику будем скрывать панель.
            $(".closeButton").on("click", this._onClose);
          },
          _onClose: function () {
            $(".customControl").css("display", "none");

            // NEW замена всех иконок на неактивные
            document
              .querySelectorAll(".ymaps-2-1-79-image")
              .forEach((element) => {
                element.style.backgroundImage = "url(img/icon.svg)";
                element.style.backgroundSize = "49px 59px";
                element.style.width = "49px";
                element.style.height = "59px";
                element.style.top = "-44px";
                element.style.left = "-15px";
              });
          },
          // Метод задания контента панели.
          setContent: function (text) {
            // При задании контента будем показывать панель.
            this._$control.css("display", "flex");
            this._$content.html(text);
          },
        });

        provide(Panel);
      }
    );
    // end panel script
  }
}

// вызываем класс и метод render
let myMap = new createMap(pointList);
myMap.render();

// end class
