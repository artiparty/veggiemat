import {tns} from "../../node_modules/tiny-slider/src/tiny-slider"

let s,
  player,
  state,
  _this,
  App;

App = {
  settings: {
    els: {
      $menu: document.querySelector('[data-menu]'),
      $menuBtn: document.querySelector('[data-menu-btn]'),
      $video: document.querySelector('[data-video]'),
      $videoBtn: document.querySelectorAll('[data-video-btn]'),
      $stickyBtn: document.querySelector('[data-sticky-btn]'),
      $galleryContainer: document.querySelector('[data-gallery]'),
      $messengerBtn: document.querySelectorAll('[data-messenger-btn]'),
    },
    state: {
      menuIsOpened: false,
      videoIsOpened: false
    },

    playerIsLoaded: false
  },

  init: function init() {
    s = this.settings;
    _this = this;
    state = s.state;
    this.events.init();

    if (s.els.$galleryContainer) {
      this.gallery.init();
    }

    if (s.els.$video) {
      this.video.init();
    }
  },

  helpers: {
    addClass: function addClass(element, className) {
      if (element.classList) {
        element.classList.add(className);
      } else {
        element.className += ' ' + className;
      }
    },

    removeClass: function removeClass(element, className) {
      if (element.classList) {
        element.classList.remove(className);
      } else {
        element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
      }
    }
  },

  video: {
    init: function () {
      const YTScript = document.createElement('script');
      YTScript.src = "https://www.youtube.com/iframe_api";
      document.getElementsByTagName('head')[0].appendChild(YTScript);

      let interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          this.createYouTubePlayer();
          s.playerIsLoaded = true;
          clearInterval(interval);
        }
      }, 1000);
    },

    createYouTubePlayer: function createYouTubePlayer() {
      player = new YT.Player('video', {
        videoId: 'MxfdzHl-igU',
        height: '360',
        width: '640',
        playerVars: {
          'autoplay': 0,
          'iv_load_policy': 3,
          'rel': 0,
          'showinfo': 0,
          'modestbranding': 1
        }
      });
    },

    play: function () {
      if (s.playerIsLoaded) {
        player.playVideo();
      } else {
        let interval = setInterval(() => {
          console.log('player is loading')
          if (s.playerIsLoaded) {
            player.playVideo();
            clearInterval(interval);
          }
        }, 1000);
      }
    },

    stop: function () {
      player.stopVideo();
    }
  },

  gallery: {
    init: function () {
      const slider = tns({
        container: '#gallery',
        nav: true,
        navContainer: "#gallery-thumbs",
        controls: false,
        slideBy: 'page',
        autoHeight: true,
        navAsThumbnails: true,
        onInit: function () {
          s.els.$galleryContainer.classList.add('--active')
        }
      });
    }
  },

  events: {
    init: function () {
      this.toggleMenu();

      if (s.els.$video) {
        this.toggleVideo();
      }

      if (window.kayako) {
        this.showMessenger();
      } else {
        let interval = setInterval(() => {
          if (window.kayako) {
            clearInterval(interval);
          }
        }, 1000);
      }
    },

    toggleMenu: function () {
      s.els.$menuBtn.addEventListener('click', function () {
        if (state.menuIsOpened) {
          _this.updateState({
            menuIsOpened: false,
          });
        } else {
          _this.updateState({
            menuIsOpened: true,
          });
        }

        _this.ui.updateUi();
      });
    },

    toggleVideo: function () {
      s.els.$videoBtn.forEach((btn) => {
        btn.addEventListener('click', function () {
          if (state.videoIsOpened) {
            _this.updateState({
              videoIsOpened: false,
            });

            _this.video.stop();
          } else {
            _this.updateState({
              videoIsOpened: true,
            });

            _this.video.play();
          }

          _this.ui.updateUi();
        });
      })
    },

    showMessenger: function () {
      s.els.$messengerBtn.forEach((btn) => {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          window.kayako.maximize();
        });
      })
    }
  },

  updateState: function updateState(newState) {
    state = Object.assign(state, newState);
  },

  ui: {
    updateUi: function updateUi() {
      const options = [
        {
          stateKey: state.menuIsOpened,
          elementKey: '$menu',
          className: '--opened'
        },
        {
          stateKey: state.menuIsOpened,
          elementKey: '$menuBtn',
          className: '--opened'
        },
        {
          stateKey: state.videoIsOpened,
          elementKey: '$video'
        }
      ];

      for (let i = 0; i < options.length; i++) {
        this.setElementUi(options[i].stateKey, s.els[options[i].elementKey], options[i].className);
      }
    },

    setElementUi: function setElementUi(state, element) {
      let className = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '--active';

      if (state) {
        _this.helpers.addClass(element, className);
      } else {
        _this.helpers.removeClass(element, className);
      }
    }
  }
};

App.init();
