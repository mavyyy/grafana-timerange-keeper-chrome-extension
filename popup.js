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
      app.history.unshift({
        uuid: generateUuid(),
        from: app.current.from,
        to: app.current.to,
        label: "<No name>"
      })
      var storage_obj = {};
      storage_obj[app.hostname] = {
        history: app.history
      }
      chrome.storage.local.set(storage_obj)
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
      app.history = this.history.filter((el)=>{return !(el.uuid === uuid);});
    },
    reset: function(e) {
      chrome.storage.local.clear();
      this.history=[]
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
    chrome.storage.local.get(null, function (items) {
      if (items[app.hostname]) {
        var storage_object = items[app.hostname];
        if (storage_object?.history) {
          app.history = storage_object.history;
        }
      }
    })
  });
});