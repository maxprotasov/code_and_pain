/******/ (function(modules) { // webpackBootstrap
  /******/ 	// The module cache
  /******/ 	var installedModules = {};
  /******/
  /******/ 	// The require function
  /******/ 	function __webpack_require__(moduleId) {
    /******/
    /******/ 		// Check if module is in cache
    /******/ 		if(installedModules[moduleId])
    /******/ 			return installedModules[moduleId].exports;
    /******/
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = installedModules[moduleId] = {
      /******/ 			exports: {},
      /******/ 			id: moduleId,
      /******/ 			loaded: false
      /******/ 		};
    /******/
    /******/ 		// Execute the module function
    /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ 		// Flag the module as loaded
    /******/ 		module.loaded = true;
    /******/
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
  /******/
  /******/
  /******/ 	// expose the modules object (__webpack_modules__)
  /******/ 	__webpack_require__.m = modules;
  /******/
  /******/ 	// expose the module cache
  /******/ 	__webpack_require__.c = installedModules;
  /******/
  /******/ 	// __webpack_public_path__
  /******/ 	__webpack_require__.p = "";
  /******/
  /******/ 	// Load entry module and return exports
  /******/ 	return __webpack_require__(0);
  /******/ })
/************************************************************************/
/******/ ([
  /* 0 */
  /***/ function(module, exports, __webpack_require__) {

    var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';


    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [
      __webpack_require__(1),
      __webpack_require__(2),
      __webpack_require__(4),
      __webpack_require__(8)
    ], __WEBPACK_AMD_DEFINE_RESULT__ = function(Game, form, reviews, Gallery){
      var game = new Game(document.querySelector('.demo'));
      game.initializeLevelAndStart();
      game.setGameStatus(Game.Verdict.INTRO);

      var formOpenButton = document.querySelector('.reviews-controls-new');

      /** @param {MouseEvent} evt */
      formOpenButton.onclick = function(evt) {
        evt.preventDefault();

        form.open(function() {
          game.setGameStatus(Game.Verdict.PAUSE);
          game.setDeactivated(true);
        });
      };

      form.onClose = function() {
        game.setDeactivated(false);
      };

      reviews();

      var galleryPicturesLinks = document.querySelectorAll('.photogallery-image');

      var galleryPictures = document.querySelectorAll('.photogallery-image img');

      var pictures = Array.prototype.map.call(galleryPictures, function(picture) {
        return picture.src;
      });

      var gallery = new Gallery(pictures);
      Array.prototype.forEach.call(galleryPicturesLinks, function(picture, activePicture) {
        picture.addEventListener('click', function () {
          gallery.show(activePicture);
        });
      });

    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


    /***/ },
  /* 1 */
  /***/ function(module, exports, __webpack_require__) {

    var __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
      /**
       * @const
       * @type {number}
       */
      var HEIGHT = 300;

      /**
       * @const
       * @type {number}
       */
      var WIDTH = 700;

      /**
       * ID уровней.
       * @enum {number}
       */
      var Level = {
        INTRO: 0,
        MOVE_LEFT: 1,
        MOVE_RIGHT: 2,
        LEVITATE: 3,
        HIT_THE_MARK: 4
      };

      /**
       * Порядок прохождения уровней.
       * @type {Array.<Level>}
       */
      var LevelSequence = [
        Level.INTRO
      ];

      /**
       * Начальный уровень.
       * @type {Level}
       */
      var INITIAL_LEVEL = LevelSequence[0];

      /**
       * Допустимые виды объектов на карте.
       * @enum {number}
       */
      var ObjectType = {
        ME: 0,
        FIREBALL: 1
      };

      /**
       * Допустимые состояния объектов.
       * @enum {number}
       */
      var ObjectState = {
        OK: 0,
        DISPOSED: 1
      };

      /**
       * Коды направлений.
       * @enum {number}
       */
      var Direction = {
        NULL: 0,
        LEFT: 1,
        RIGHT: 2,
        UP: 4,
        DOWN: 8
      };

      /**
       * Карта спрайтов игры.
       * @type {Object.<ObjectType, Object>}
       */
      var SpriteMap = {};
      var REVERSED = '-reversed';

      SpriteMap[ObjectType.ME] = {
        width: 61,
        height: 84,
        url: 'img/wizard.gif'
      };

      //TODO: Find a clever way
      SpriteMap[ObjectType.ME + REVERSED] = {
        width: 61,
        height: 84,
        url: 'img/wizard-reversed.gif'
      };

      SpriteMap[ObjectType.FIREBALL] = {
        width: 24,
        height: 24,
        url: 'img/fireball.gif'
      };

      /**
       * Правила перерисовки объектов в зависимости от состояния игры.
       * @type {Object.<ObjectType, function(Object, Object, number): Object>}
       */
      var ObjectsBehaviour = {};

      /**
       * Обновление движения мага. Движение мага зависит от нажатых в данный момент
       * стрелок. Маг может двигаться одновременно по горизонтали и по вертикали.
       * На движение мага влияет его пересечение с препятствиями.
       * @param {Object} object
       * @param {Object} state
       * @param {number} timeframe
       */
      ObjectsBehaviour[ObjectType.ME] = function(object, state, timeframe) {
        // Пока зажата стрелка вверх, маг сначала поднимается, а потом левитирует
        // в воздухе на определенной высоте.
        // NB! Сложность заключается в том, что поведение описано в координатах
        // канваса, а не координатах, относительно нижней границы игры.
        if (state.keysPressed.UP && object.y > 0) {
          object.direction = object.direction & ~Direction.DOWN;
          object.direction = object.direction | Direction.UP;
          object.y -= object.speed * timeframe * 2;
        }

        // Если стрелка вверх не зажата, а маг находится в воздухе, он плавно
        // опускается на землю.
        if (!state.keysPressed.UP) {
          if (object.y < HEIGHT - object.height) {
            object.direction = object.direction & ~Direction.UP;
            object.direction = object.direction | Direction.DOWN;
            object.y += object.speed * timeframe / 3;
          }
        }

        // Если зажата стрелка влево, маг перемещается влево.
        if (state.keysPressed.LEFT) {
          object.direction = object.direction & ~Direction.RIGHT;
          object.direction = object.direction | Direction.LEFT;
          object.x -= object.speed * timeframe;
        }

        // Если зажата стрелка вправо, маг перемещается вправо.
        if (state.keysPressed.RIGHT) {
          object.direction = object.direction & ~Direction.LEFT;
          object.direction = object.direction | Direction.RIGHT;
          object.x += object.speed * timeframe;
        }

        // Ограничения по перемещению по полю. Маг не может выйти за пределы поля.
        if (object.y < 0) {
          object.y = 0;
        }

        if (object.y > HEIGHT - object.height) {
          object.y = HEIGHT - object.height;
        }

        if (object.x < 0) {
          object.x = 0;
        }

        if (object.x > WIDTH - object.width) {
          object.x = WIDTH - object.width;
        }
      };

      /**
       * Обновление движения файрбола. Файрбол выпускается в определенном направлении
       * и после этого неуправляемо движется по прямой в заданном направлении. Если
       * он пролетает весь экран насквозь, он исчезает.
       * @param {Object} object
       * @param {Object} _state
       * @param {number} timeframe
       */
      ObjectsBehaviour[ObjectType.FIREBALL] = function(object, _state, timeframe) {
        if (object.direction & Direction.LEFT) {
          object.x -= object.speed * timeframe;
        }

        if (object.direction & Direction.RIGHT) {
          object.x += object.speed * timeframe;
        }

        if (object.x < 0 || object.x > WIDTH) {
          object.state = ObjectState.DISPOSED;
        }
      };

      /**
       * ID возможных ответов функций, проверяющих успех прохождения уровня.
       * CONTINUE говорит о том, что раунд не закончен и игру нужно продолжать,
       * WIN о том, что раунд выигран, FAIL — о поражении. PAUSE о том, что игру
       * нужно прервать.
       * @enum {number}
       */
      var Verdict = {
        CONTINUE: 0,
        WIN: 1,
        FAIL: 2,
        PAUSE: 3,
        INTRO: 4
      };

      /**
       * Правила завершения уровня. Ключами служат ID уровней, значениями функции
       * принимающие на вход состояние уровня и возвращающие true, если раунд
       * можно завершать или false если нет.
       * @type {Object.<Level, function(Object):boolean>}
       */
      var LevelsRules = {};

      /**
       * Уровень считается пройденным, если был выпущен файлболл и он улетел
       * за экран.
       * @param {Object} state
       * @return {Verdict}
       */
      LevelsRules[Level.INTRO] = function(state) {
        var fireballs = state.garbage.filter(function(object) {
          return object.type === ObjectType.FIREBALL;
        });

        return fireballs.length ? Verdict.WIN : Verdict.CONTINUE;
      };

      /**
       * Начальные условия для уровней.
       * @enum {Object.<Level, function>}
       */
      var LevelsInitialize = {};

      /**
       * Первый уровень.
       * @param {Object} state
       * @return {Object}
       */
      LevelsInitialize[Level.INTRO] = function(state) {
        state.objects.push(
          // Установка персонажа в начальное положение. Он стоит в крайнем левом
          // углу экрана, глядя вправо. Скорость перемещения персонажа на этом
          // уровне равна 2px за кадр.
          {
            direction: Direction.RIGHT,
            height: 84,
            speed: 2,
            sprite: SpriteMap[ObjectType.ME],
            state: ObjectState.OK,
            type: ObjectType.ME,
            width: 61,
            x: WIDTH / 3,
            y: HEIGHT - 100
          }
        );

        return state;
      };

      /**
       * Конструктор объекта Game. Создает canvas, добавляет обработчики событий
       * и показывает приветственный экран.
       * @param {Element} container
       * @constructor
       */
      var Game = function(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.container.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._pauseListener = this._pauseListener.bind(this);

        this.setDeactivated(false);
      };

      Game.prototype = {
        /**
         * Текущий уровень игры.
         * @type {Level}
         */
        level: INITIAL_LEVEL,

        /** @param {boolean} deactivated */
        setDeactivated: function(deactivated) {
          if (this._deactivated === deactivated) {
            return;
          }

          this._deactivated = deactivated;

          if (deactivated) {
            this._removeGameListeners();
          } else {
            this._initializeGameListeners();
          }
        },

        /**
         * Состояние игры. Описывает местоположение всех объектов на игровой карте
         * и время проведенное на уровне и в игре.
         * @return {Object}
         */
        getInitialState: function() {
          return {
            // Статус игры. Если CONTINUE, то игра продолжается.
            currentStatus: Verdict.CONTINUE,

            // Объекты, удаленные на последнем кадре.
            garbage: [],

            // Время с момента отрисовки предыдущего кадра.
            lastUpdated: null,

            // Состояние нажатых клавиш.
            keysPressed: {
              ESC: false,
              LEFT: false,
              RIGHT: false,
              SPACE: false,
              UP: false
            },

            // Время начала прохождения уровня.
            levelStartTime: null,

            // Все объекты на карте.
            objects: [],

            // Время начала прохождения игры.
            startTime: null
          };
        },

        /**
         * Начальные проверки и запуск текущего уровня.
         * @param {boolean=} restart
         */
        initializeLevelAndStart: function(restart) {
          restart = typeof restart === 'undefined' ? true : restart;

          if (restart || !this.state) {
            // При перезапуске уровня, происходит полная перезапись состояния
            // игры из изначального состояния.
            this.state = this.getInitialState();
            this.state = LevelsInitialize[this.level](this.state);
          } else {
            // При продолжении уровня состояние сохраняется, кроме записи о том,
            // что состояние уровня изменилось с паузы на продолжение игры.
            this.state.currentStatus = Verdict.CONTINUE;
          }

          // Запись времени начала игры и времени начала уровня.
          this.state.levelStartTime = Date.now();
          if (!this.state.startTime) {
            this.state.startTime = this.state.levelStartTime;
          }

          this._preloadImagesForLevel(function() {
            // Предварительная отрисовка игрового экрана.
            this.render();

            // Установка обработчиков событий.
            this._initializeGameListeners();

            // Запуск игрового цикла.
            this.update();
          }.bind(this));
        },

        /**
         * Временная остановка игры.
         * @param {Verdict=} verdict
         */
        pauseLevel: function(verdict) {
          if (verdict) {
            this.state.currentStatus = verdict;
          }

          this.state.keysPressed.ESC = false;
          this.state.lastUpdated = null;

          this._removeGameListeners();
          window.addEventListener('keydown', this._pauseListener);

          this._drawPauseScreen();
        },

        /**
         * Обработчик событий клавиатуры во время паузы.
         * @param {KeyboardsEvent} evt
         * @private
         * @private
         */
        _pauseListener: function(evt) {
          if (evt.keyCode === 32 && !this._deactivated) {
            evt.preventDefault();
            var needToRestartTheGame = this.state.currentStatus === Verdict.WIN ||
              this.state.currentStatus === Verdict.FAIL;
            this.initializeLevelAndStart(needToRestartTheGame);

            window.removeEventListener('keydown', this._pauseListener);
          }
        },

        /**
         * Отрисовка экрана паузы.
         */
        _drawPauseScreen: function() {


          switch (this.state.currentStatus) {
            case Verdict.WIN:
              drawBox.call(this, 'Вы победили!', 300);
              console.log('You have won!');
              break;
            case Verdict.FAIL:
              drawBox.call(this, 'Вы проиграли!', 300);
              console.log('You have failed!');
              break;
            case Verdict.PAUSE:
              drawBox.call(this, 'Пауза', 300);
              console.log('Game is on pause!');
              break;
            case Verdict.INTRO:
              drawBox.call(this ,'Добро пожаловать! Нажмите Пробел чтобы начать', 300 );
              console.log('Welcome to the game! Press Space to start');
              break;
          }

          function drawBox( message, recievedWidth ) {

            this.ctx.font = '16px PT Mono';
            this.ctx.textBaseline = 'hanging';

            var arrWord = message.split( ' ' ),
              arrLine = [],
              bufferString = "",
              testString = arrWord[0] + ' ';
            for (let i = 0; i <= arrWord.length - 1; i++) {
              if ( this.ctx.measureText( testString ).width <= recievedWidth - 30 ) {
                bufferString += arrWord[i] + ' ';
              } else {
                testString = '';
                testString = arrWord[i];
                arrLine.push(bufferString);
                bufferString = '';
                bufferString += arrWord[i] + ' ';
              };
              if (i == arrWord.length - 1) {
                arrLine.push(bufferString);
              };
              testString += arrWord[i+1] + ' ';
            };

            var box = {
              height: arrLine.length * 16 + 30,
              width: recievedWidth
            };
            box.left = this.canvas.width/2 - recievedWidth/2;
            box.top = this.canvas.height/2 - box.height/2;

            this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            this.ctx.fillRect( box.left + 10, box.top + 10, box.width, box.height);
            this.ctx.fillStyle = "#FFF";
            this.ctx.fillRect( box.left, box.top, box.width, box.height);
            this.ctx.fillStyle = "#000";
            for (let i = 0; i <= arrLine.length - 1; i++) {
              this.ctx.fillText( arrLine[i], box.left + 15, box.top + 15 + i * 18);
            }
          }

        },

        /**
         * Предзагрузка необходимых изображений для уровня.
         * @param {function} callback
         * @private
         */
        _preloadImagesForLevel: function(callback) {
          if (typeof this._imagesArePreloaded === 'undefined') {
            this._imagesArePreloaded = [];
          }

          if (this._imagesArePreloaded[this.level]) {
            callback();
            return;
          }

          var keys = Object.keys(SpriteMap);
          var imagesToGo = keys.length;

          var self = this;

          var loadSprite = function(sprite) {
            var image = new Image(sprite.width, sprite.height);
            image.onload = function() {
              sprite.image = image;
              if (--imagesToGo === 0) {
                self._imagesArePreloaded[self.level] = true;
                callback();
              }
            };
            image.src = sprite.url;
          };

          for (var i = 0; i < keys.length; i++) {
            loadSprite(SpriteMap[keys[i]]);
          }
        },

        /**
         * Обновление статуса объектов на экране. Добавляет объекты, которые должны
         * появиться, выполняет проверку поведения всех объектов и удаляет те, которые
         * должны исчезнуть.
         * @param {number} delta Время, прошеднее с отрисовки прошлого кадра.
         */
        updateObjects: function(delta) {
          // Персонаж.
          var me = this.state.objects.filter(function(object) {
            return object.type === ObjectType.ME;
          })[0];

          // Добавляет на карту файрбол по нажатию на Shift.
          if (this.state.keysPressed.SHIFT) {
            this.state.objects.push({
              direction: me.direction,
              height: 24,
              speed: 5,
              sprite: SpriteMap[ObjectType.FIREBALL],
              type: ObjectType.FIREBALL,
              width: 24,
              x: me.direction & Direction.RIGHT ? me.x + me.width : me.x - 24,
              y: me.y + me.height / 2
            });

            this.state.keysPressed.SHIFT = false;
          }

          this.state.garbage = [];

          // Убирает в garbage не используемые на карте объекты.
          var remainingObjects = this.state.objects.filter(function(object) {
            ObjectsBehaviour[object.type](object, this.state, delta);

            if (object.state === ObjectState.DISPOSED) {
              this.state.garbage.push(object);
              return false;
            }

            return true;
          }, this);

          this.state.objects = remainingObjects;
        },

        /**
         * Проверка статуса текущего уровня.
         */
        checkStatus: function() {
          // Нет нужны запускать проверку, нужно ли останавливать уровень, если
          // заранее известно, что да.
          if (this.state.currentStatus !== Verdict.CONTINUE) {
            return;
          }

          if (!this.commonRules) {
            /**
             * Проверки, не зависящие от уровня, но влияющие на его состояние.
             * @type {Array.<functions(Object):Verdict>}
             */
            this.commonRules = [
              /**
               * Если персонаж мертв, игра прекращается.
               * @param {Object} state
               * @return {Verdict}
               */
                function(state) {
                var me = state.objects.filter(function(object) {
                  return object.type === ObjectType.ME;
                })[0];

                return me.state === ObjectState.DISPOSED ?
                  Verdict.FAIL :
                  Verdict.CONTINUE;
              },

              /**
               * Если нажата клавиша Esc игра ставится на паузу.
               * @param {Object} state
               * @return {Verdict}
               */
                function(state) {
                return state.keysPressed.ESC ? Verdict.PAUSE : Verdict.CONTINUE;
              },

              /**
               * Игра прекращается если игрок продолжает играть в нее два часа подряд.
               * @param {Object} state
               * @return {Verdict}
               */
                function(state) {
                return Date.now() - state.startTime > 3 * 60 * 1000 ?
                  Verdict.FAIL :
                  Verdict.CONTINUE;
              }
            ];
          }

          // Проверка всех правил влияющих на уровень. Запускаем цикл проверок
          // по всем универсальным проверкам и проверкам конкретного уровня.
          // Цикл продолжается до тех пор, пока какая-либо из проверок не вернет
          // любое другое состояние кроме CONTINUE или пока не пройдут все
          // проверки. После этого состояние сохраняется.
          var allChecks = this.commonRules.concat(LevelsRules[this.level]);
          var currentCheck = Verdict.CONTINUE;
          var currentRule;

          while (currentCheck === Verdict.CONTINUE && allChecks.length) {
            currentRule = allChecks.shift();
            currentCheck = currentRule(this.state);
          }

          this.state.currentStatus = currentCheck;
        },

        /**
         * Принудительная установка состояния игры. Используется для изменения
         * состояния игры от внешних условий, например, когда необходимо остановить
         * игру, если она находится вне области видимости и установить вводный
         * экран.
         * @param {Verdict} status
         */
        setGameStatus: function(status) {
          if (this.state.currentStatus !== status) {
            this.state.currentStatus = status;
          }
        },

        /**
         * Отрисовка всех объектов на экране.
         */
        render: function() {
          // Удаление всех отрисованных на странице элементов.
          this.ctx.clearRect(0, 0, WIDTH, HEIGHT);

          // Выставление всех элементов, оставшихся в this.state.objects согласно
          // их координатам и направлению.
          this.state.objects.forEach(function(object) {
            if (object.sprite) {
              var reversed = object.direction & Direction.LEFT;
              var sprite = SpriteMap[object.type + (reversed ? REVERSED : '')] || SpriteMap[object.type];
              this.ctx.drawImage(sprite.image, object.x, object.y, object.width, object.height);
            }
          }, this);
        },

        /**
         * Основной игровой цикл. Сначала проверяет состояние всех объектов игры
         * и обновляет их согласно правилам их поведения, а затем запускает
         * проверку текущего раунда. Рекурсивно продолжается до тех пор, пока
         * проверка не вернет состояние FAIL, WIN или PAUSE.
         */
        update: function() {
          if (!this.state.lastUpdated) {
            this.state.lastUpdated = Date.now();
          }

          var delta = (Date.now() - this.state.lastUpdated) / 10;
          this.updateObjects(delta);
          this.checkStatus();

          switch (this.state.currentStatus) {
            case Verdict.CONTINUE:
              this.state.lastUpdated = Date.now();
              this.render();
              requestAnimationFrame(function() {
                this.update();
              }.bind(this));
              break;

            case Verdict.WIN:
            case Verdict.FAIL:
            case Verdict.PAUSE:
            case Verdict.INTRO:
              this.pauseLevel();
              break;
          }
        },

        /**
         * @param {KeyboardEvent} evt [description]
         * @private
         */
        _onKeyDown: function(evt) {
          switch (evt.keyCode) {
            case 37:
              this.state.keysPressed.LEFT = true;
              break;
            case 39:
              this.state.keysPressed.RIGHT = true;
              break;
            case 38:
              this.state.keysPressed.UP = true;
              break;
            case 27:
              this.state.keysPressed.ESC = true;
              break;
          }

          if (evt.shiftKey) {
            this.state.keysPressed.SHIFT = true;
          }
        },

        /**
         * @param {KeyboardEvent} evt [description]
         * @private
         */
        _onKeyUp: function(evt) {
          switch (evt.keyCode) {
            case 37:
              this.state.keysPressed.LEFT = false;
              break;
            case 39:
              this.state.keysPressed.RIGHT = false;
              break;
            case 38:
              this.state.keysPressed.UP = false;
              break;
            case 27:
              this.state.keysPressed.ESC = false;
              break;
          }

          if (evt.shiftKey) {
            this.state.keysPressed.SHIFT = false;
          }
        },

        /** @private */
        _initializeGameListeners: function() {
          window.addEventListener('keydown', this._onKeyDown);
          window.addEventListener('keyup', this._onKeyUp);
        },

        /** @private */
        _removeGameListeners: function() {
          window.removeEventListener('keydown', this._onKeyDown);
          window.removeEventListener('keyup', this._onKeyUp);
        }
      };

      Game.Verdict = Verdict;

      var SHIFT_COFFICIENT = 1,
        THROTTLE_DELAY = 100,
        cloudsBlock = document.querySelector('.header-clouds'),
        gameBlock = document.querySelector('.demo'),
        cloudsAreVisible;

      function checkVisibility() {
        var rect = cloudsBlock.getBoundingClientRect();
        cloudsAreVisible = (rect.height + rect.top) > 0;
        // rect = gameBlock.getBoundingClientRect();
        // if ((rect.height + rect.top) > 0) {
        //   Game.prototype.setGameStatus(Game.Verdict.PAUSE);
        // };
      }


      (function setScrollEnabled() {
        var lastDate = Date.now();
        window.addEventListener('scroll', function () {
          if (Date.now() - lastDate >= THROTTLE_DELAY) {
            checkVisibility();
            lastDate = Date.now();
          }
          if (cloudsAreVisible) {
            cloudsBlock.style.backgroundPositionX = -(window.pageYOffset * SHIFT_COFFICIENT) + 'px';
          }
        });
      })();



      return Game;
    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


    /***/ },
  /* 2 */
  /***/ function(module, exports, __webpack_require__) {

    var __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
      var formContainer = document.querySelector('.overlay-container');
      var formCloseButton = document.querySelector('.review-form-close');

      var form = {
        onClose: null,

        /**
         * @param {Function} cb
         */
        open: function(cb) {
          formContainer.classList.remove('invisible');
          cb();
        },

        close: function() {
          formContainer.classList.add('invisible');

          if (typeof this.onClose === 'function') {
            this.onClose();
          }
        }
      };


      formCloseButton.onclick = function(evt) {
        evt.preventDefault();
        form.close();
      };

      var formElements = document.querySelector(".review-form");
      var labelName = document.querySelector(".review-fields-name");
      var labelText = document.querySelector(".review-fields-text");
      var formLabels = document.querySelector(".review-fields");
      var formButton = document.querySelector(".review-submit");
      var inputName = document.querySelector("#review-name");
      var inputArea = document.querySelector("#review-text");
      var radioGroup = document.querySelector(".review-form-group-mark");
      var browserCookies = __webpack_require__(3);


      formButton.disabled = true;
      inputName.required = true;

      var checkMark = function() {
        var radioChecked = document.querySelector('input[name=review-mark]:checked');
        if (radioChecked.value < 3) {
          labelText.classList.remove('invisible');
          inputArea.required = true;
        } else {
          labelText.classList.add('invisible');
          inputArea.required = false;
        }

      };

      var checkName = function () {
        inputName.value = browserCookies.get('name') || '';
      };

      var formValidityCheck = function() {
        var formIsValid = inputName.validity.valid && inputArea.validity.valid;
        formButton.disabled = !formIsValid;
        formLabels.classList.toggle('invisible', formIsValid);
      };

      var setRating = function() {
        var ratingFromCookies = browserCookies.get('rating'),
          radios = document.querySelectorAll('input[name=review-mark]');
        if (ratingFromCookies) {
          for (let item of radios) {
            item.checked = ratingFromCookies && (item.value == ratingFromCookies);
          }
        }
      };
      setRating();
      checkName();
      formValidityCheck();
      checkMark();

      var findExpirePeriod = function() {
        var currentYearBirthDate = new Date('2016-04-05'),
          dateNow = new Date();
        currentYearBirthDate.setFullYear(dateNow.getFullYear());
        if (dateNow - currentYearBirthDate <= 0) {
          currentYearBirthDate.setFullYear(currentYearBirthDate.getFullYear() - 1);
        }
        var date = +dateNow - +currentYearBirthDate;
        return new Date(dateNow * 2 - currentYearBirthDate);
      };

      inputName.oninput = function () {
        labelName.classList.toggle('invisible', inputName.validity.valid);
        formValidityCheck();
      };

      inputArea.oninput = function () {
        labelText.classList.toggle('invisible', inputArea.validity.valid);
        formValidityCheck();
      };

      radioGroup.onchange = function() {
        checkMark();
        formValidityCheck();
      };

      formElements.onsubmit = function () {
        var radioChecked = document.querySelector('input[name=review-mark]:checked');
        browserCookies.set('rating', radioChecked.value, {
          expires: findExpirePeriod()
        });
        browserCookies.set('name', inputName.value, {
          expires: findExpirePeriod()
        });

      };

      return form;
    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


    /***/ },
  /* 3 */
  /***/ function(module, exports) {

    exports.defaults = {};

    exports.set = function(name, value, options) {
      // Retrieve options and defaults
      var opts = options || {};
      var defaults = exports.defaults;

      // Apply default value for unspecified options
      var expires  = opts.expires || defaults.expires;
      var domain   = opts.domain  || defaults.domain;
      var path     = opts.path     != undefined ? opts.path     : (defaults.path != undefined ? defaults.path : '/');
      var secure   = opts.secure   != undefined ? opts.secure   : defaults.secure;
      var httponly = opts.httponly != undefined ? opts.httponly : defaults.httponly;

      // Determine cookie expiration date
      // If succesful the result will be a valid Date, otherwise it will be an invalid Date or empty string
      var expDate = expires == undefined ? '' :
        // in case expires is an integer, it (should) specify the amount in days till the cookie expires
        typeof expires == 'number' ? new Date(new Date().getTime() + (expires * 864e5)) :
          // in case expires is (probably) a Date object
          expires.getTime ? expires :
            // in case expires is not in any of the above formats, try parsing as a format recognized by Date.parse()
            new Date(expires);

      // Set cookie
      document.cookie = encodeURIComponent(name) + '=' +                          // Encode cookie name
        value.replace(/[^#\$&\+/:<-\[\]-}]/g, encodeURIComponent) +                 // Encode cookie value (RFC6265)
        (expDate && expDate.getTime() ? ';expires=' + expDate.toUTCString() : '') + // Add expiration date
        (domain   ? ';domain=' + domain : '') +                                     // Add domain
        (path     ? ';path='   + path   : '') +                                     // Add path
        (secure   ? ';secure'           : '') +                                     // Add secure option
        (httponly ? ';httponly'         : '');                                      // Add httponly option
    };

    exports.get = function(name) {
      var cookies = document.cookie.split(';');

      // Iterate all cookies
      for(var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];

        // Determine separator index ("name=value")
        var separatorIndex = cookie.indexOf('=');

        // If a separator index is found, Decode the cookie name and compare to the requested cookie name
        if (separatorIndex != -1 && decodeURIComponent(cookie.substring(0, separatorIndex).replace(/^\s+|\s+$/g,'')) == name) {
          return decodeURIComponent(cookie.substring(separatorIndex + 1, cookie.length));
        }
      }

      return null;
    };

    exports.erase = function(name, options) {
      exports.set(name, '', {
        expires:  -1,
        domain:   options && options.domain,
        path:     options && options.path,
        secure:   false,
        httponly: false}
      );
    };


    /***/ },
  /* 4 */
  /***/ function(module, exports, __webpack_require__) {

    var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [
      __webpack_require__(5),
      __webpack_require__(6),
      __webpack_require__(7)
    ], __WEBPACK_AMD_DEFINE_RESULT__ = function( utils,render,load ) {
      return function () {
        var showMoreButton = document.querySelector('.reviews-controls-more'),
          filterBlock = document.querySelector('.reviews-filter'),
          elementToClone, reviewsCollection, numberOfCurrentPage = 1;

        /** @const {string} */
        var REVIEWS_URL = '//o0.github.io/assets/json/reviews.json';

        load.getReviews( REVIEWS_URL , function (loadedReviews) {
          var reviewsFromServer = loadedReviews;
          reviewsCollection = utils.makeReviewsCollection(reviewsFromServer);
          render.setNumberOfReviews(reviewsCollection);
          numberOfCurrentPage = render.setFilterEnabled( reviewsCollection[utils.selectedFilterId()] );
          filterBlock.addEventListener('click', function (event) {
            if (event.target.tagName == 'INPUT') {
              numberOfCurrentPage = render.setFilterEnabled( reviewsCollection[event.target.id]);
            };
          });
          showMoreButton.addEventListener('click', function () {
            numberOfCurrentPage++;
            render.renderReviews(reviewsCollection[utils.selectedFilterId()], numberOfCurrentPage);
          });
        });
      };
    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


    /***/ },
  /* 5 */
  /***/ function(module, exports, __webpack_require__) {

    var __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
      return {
        selectedFilterId : function () {
          return document.querySelector('input[name=reviews]:checked').id;
        },
        /** @param {Array.<Object>} reviewsObject */
        setEmptyFilterDisabled : function (nameOfList) {
          document.querySelector('#' + nameOfList).disabled = true;
          document.querySelector('label[for=' + nameOfList + ']').classList.add('reviews-filter-item-disabled');
        },
        /**
         * @param {Array.<Object>} loadedReviews
         * @return {Object.Array.<Object>} reviewsObject
         */
        makeReviewsCollection : function (loadedReviews) {
          var list = loadedReviews.slice(0),
            reviewsObject = new Object();

          reviewsObject['reviews-all'] = list;

          reviewsObject['reviews-recent'] = list.filter( function (item) {
            var dateNow = new Date(),
              dateOfPost = new Date(item.date);
            return (dateNow - dateOfPost) <= (4*24*60*60*1000);
          }).sort(function (first, second){
            var firstDate = new Date(first.date),
              secondDate = new Date(second.date);
            return secondDate - firstDate;
          });

          list = loadedReviews.slice(0);

          reviewsObject['reviews-good'] = list.filter( function(item) {
            return item.rating >= 3;
          }).sort(function (first, second){
            return second.rating - first.rating;
          });

          list = loadedReviews.slice(0);

          reviewsObject['reviews-bad'] = list.filter( function(item) {
            return item.rating <= 2;
          }).sort(function (first, second){
            return first.rating - second.rating;
          });

          list = loadedReviews.slice(0);

          reviewsObject['reviews-popular'] = list.sort(function (first, second){
            return second.review_usefulness - first.review_usefulness;
          });

          return reviewsObject;
        }
      }
    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


    /***/ },
  /* 6 */
  /***/ function(module, exports, __webpack_require__) {

    var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(5)], __WEBPACK_AMD_DEFINE_RESULT__ = function(utils) {
      return {
        /**
         * @param {Object} data
         * @param {HTMLElement} container
         * @return {HTMLElement}
         */
        renderReviewElement : function (data, container) {
          var elementToClone,
            templateElement = document.querySelector ('template');

          if ( 'content' in templateElement ) {
            elementToClone = templateElement.content.querySelector ('.review');
          } else {
            elementToClone = templateElement.querySelector ('.review');
          }

          var element = elementToClone.cloneNode(true);
          element.querySelector('.review-author').alt = data.author.name;

          var reviewRating = element.querySelector('.review-rating');
          switch ( data.rating ) {
            case 1:
              reviewRating.classList.add('review-rating-one');
              break;
            case 2:
              reviewRating.classList.add('review-rating-two');
              break;
            case 3:
              reviewRating.classList.add('review-rating-three');
              break;
            case 4:
              reviewRating.classList.add('review-rating-four');
              break;
            case 5:
              reviewRating.classList.add('review-rating-five');
              break;
          }

          var avatarImage = new Image (),
            image = element.querySelector('.review-author');

          avatarImage.addEventListener('load', function (event) {
            image.src = event.target.src;
            image.style.width = '124px';
            image.style.height = '124px';
          });

          avatarImage.addEventListener('error', function (event) {
            element.classList.add('review-load-failure');
          });

          avatarImage.src = data.author.picture;

          element.querySelector('.review-text').textContent = data.description;

          container.appendChild (element);
          return element;
        },
        /**
         * @param {Array.<Object>} reviews
         * @param {number} page
         * @param {boolean} rewrite
         */
        renderReviews : function (reviewsFiltered, page, rewrite) {

          var showMoreButton = document.querySelector('.reviews-controls-more');
          /** @const {number} */
          var REVIEWS_PER_PAGE = 3;
          var reviewsContainer = document.querySelector ('.reviews-list'),
            firstReview = (page - 1) * REVIEWS_PER_PAGE,
            listOfCurrentPage = reviewsFiltered.slice( firstReview , firstReview + REVIEWS_PER_PAGE ),
            rewrite = rewrite || false,
            lastPage = page * REVIEWS_PER_PAGE >= reviewsFiltered.length,
            renderReviewElement = this.renderReviewElement;
          if (rewrite) {
            reviewsContainer.innerHTML = ''
          }
          listOfCurrentPage.forEach (function (item) {
            renderReviewElement (item, reviewsContainer);
          });
          showMoreButton.classList.toggle('invisible', lastPage);
        },
        /** @param {Object.Array.<Object>} reviewsObject */
        setNumberOfReviews : function (reviewsObject) {
          for (let key in reviewsObject) {
            var parentElement = document.querySelector('label[for=' + key + ']'),
              sup = document.createElement('sup');
            sup.textContent = reviewsObject[key].length;
            parentElement.appendChild(sup);

            if (reviewsObject[key].length == 0) {
              utils.setEmptyFilterDisabled(key);
            }
          }
        },
        /** @param {string} filter */
        setFilterEnabled : function (currentListOfReviews) {
          var numberOfCurrentPage = 1;
          this.renderReviews(currentListOfReviews, numberOfCurrentPage, true);
          return numberOfCurrentPage;
        }
      }
    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


    /***/ },
  /* 7 */
  /***/ function(module, exports, __webpack_require__) {

    var __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
      return {
        /** @param {function(Array.<Object>)} callback */
        getReviews : function (url, callback) {
          var reviewsBlock = document.querySelector('.reviews'),
            xhr = new XMLHttpRequest();

          reviewsBlock.classList.add('reviews-list-loading');

          xhr.addEventListener('load', function (event) {
            callback(JSON.parse( event.target.response));
          });

          var failedToLoad = function () {
            reviewsBlock.classList.add('reviews-load-failure');
            reviewsBlock.classList.remove('reviews-list-loading');
          };

          xhr.addEventListener('error', failedToLoad());

          xhr.timeout = 5000;
          xhr.addEventListener('timeout', failedToLoad());

          xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState == 4) {
              reviewsBlock.classList.remove('reviews-list-loading');
            };
          });

          xhr.open('GET', url );
          xhr.send();

        }
      }
    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


    /***/ },
  /* 8 */
  /***/ function(module, exports, __webpack_require__) {

    var __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {

      var Gallery = function (src) {
        this.pictures = src;
        this.activePicture = 2;
        this.galleryContainer = document.querySelector('.overlay-gallery');
        this.galleryClose = this.galleryContainer.querySelector('.overlay-gallery-close');
        this.controlPrevious = this.galleryContainer.querySelector('.overlay-gallery-control-left');
        this.controlNext = this.galleryContainer.querySelector('.overlay-gallery-control-right');
        this.numberCurrentImg = this.galleryContainer.querySelector('.preview-number-current');
        this.numberTotalImg = this.galleryContainer.querySelector('.preview-number-total');

        this.numberTotalImg.innerText = this.pictures.length;

      };
      Gallery.prototype = {

        show: function(activePicture) {
          var self = this;

          this.galleryClose.onclick = function() {
            self.hide();
          };

          this.controlPrevious.onclick = function() {
            self.showPrevious();
          };

          this.controlNext.onclick = function() {
            self.showNext();
          };

          this.galleryContainer.classList.remove('invisible');

          this.setActivePicture(activePicture);
        },

        showPrevious: function () {
          if (this.activePicture > 0) {
            this.setActivePicture(this.activePicture - 1);
          }
        },

        showNext: function () {
          if (this.activePicture < this.pictures.length - 1) {
            this.setActivePicture(this.activePicture + 1);
          }
        },

        hide: function () {
          this.galleryContainer.classList.add('invisible');
          this.galleryClose.onclick = null;
          this.controlPrevious.onclick = null;
          this.controlNext.onclick = null;
        },
        setActivePicture: function (activePicture) {
          var galleryPreview = document.querySelector('.overlay-gallery-preview');
          this.activePicture = activePicture;

          var image = new Image();

          image.src = this.pictures[activePicture];
          if (galleryPreview.lastElementChild.nodeName === 'IMG') {
            galleryPreview.replaceChild(image, galleryPreview.lastElementChild);
          } else {
            galleryPreview.appendChild(image);
          }

          this.numberCurrentImg.innerText = activePicture + 1;

        }
      };
      return Gallery;
    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


    /***/ }
  /******/ ]);
//# sourceMappingURL=main.js.map?dropcache
