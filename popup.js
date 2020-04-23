function generateUuid() {
  // https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
  // const FORMAT: string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
  for (let i = 0, len = chars.length; i < len; i++) {
      switch (chars[i]) {
          case "x":
              chars[i] = Math.floor(Math.random() * 16).toString(16);
              break;
          case "y":
              chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
              break;
      }
  }
  return chars.join("");
}

function sync_storage(){
  var storage_obj = {};
  storage_obj[app.hostname] = {
    history: app.history
  }
  chrome.storage.local.set(storage_obj)
}

var tabId = null;


const app = new Vue({
  el: "#app",
  data: {
    isGrafanaWindow: false,
    hostname: null,
    current: {
      from: null,
      to: null
    },
    history: []
  },
  computed: {
    current_from: function () {
      return this.epochToStr(this.current.from);
    },
    current_to: function () {
      return this.epochToStr(this.current.to);
    }
  },
  methods: {
    epochToStr: function (epoch) {
      return new Date(parseInt(epoch)).toLocaleString()
    },
    store: function(){
      this.history.unshift({
        uuid: generateUuid(),
        from: this.current.from,
        to: this.current.to,
        label: "<No name>"
      })
      sync_storage();
    },
    recall: function (e) {
      var uuid = e.target.id.split("_")[1];
      var el = this.history.filter((el)=>{return (el.uuid === uuid);})[0];
      this.current ={
        from :el.from,
        to:el.to
      }
      chrome.tabs.sendMessage(tabId, {
        type: "apply",
        from: this.current.from,
        to: this.current.to
      });
    },
    remove: function (e) {
      var uuid = e.target.id.split("_")[1];
      this.history = this.history.filter((el)=>{return !(el.uuid === uuid);});
      sync_storage();
    },
    reset: function(e) {
      this.history=[];
      sync_storage();
    }
  }
})

chrome.tabs.query({
  'active': true,
  'currentWindow': true
}, function (tab) {
  tabId = tab[0].id;
  chrome.tabs.sendMessage(tabId, {
    type: "popup"
  }, function (response) {
    app.isGrafanaWindow = response.isGrafanaWindow;
    if (!response.isGrafanaWindow) {
      return;
    }
    app.current = response.current;
    app.hostname = response.hostname;
    chrome.storage.local.get(app.hostname, function (items) {
      if (items[app.hostname] && items[app.hostname].history) {
          app.history = items[app.hostname].history;
      }
    })
  });
});