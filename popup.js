function epochToStr(epoch){
  return new Date(parseInt(epoch)).toLocaleString()
}


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
  el:"#app",
  data:{
    isGrafanaWindow:false,
    hostname:null,
    current:{
      from:null,
      to:null
    },
    configured:{
      from:null,
      to:null
    },
    stored:[]
  },
  computed:{
    current_from:function(){
      return epochToStr(this.current.from);
    },
    current_to:function(){
      return epochToStr(this.current.to);
    },
    configured_from:function(){
      return epochToStr(this.configured.from);
    },
    configured_to:function(){
      return epochToStr(this.configured.to);
    }
  }
})



function setCongifuredTimeRange(e) {
  app.configured.from = app.current.from;
  app.configured.to = app.current.to;
  app.stored.unshift({
    uuid:generateUuid(),
    from:app.current.from,
    to: app.current.to,
    label:"hoge"
  })
  var storage_obj = {};
  storage_obj[app.hostname] = {
    configured: app.configured,
    stored:app.stored
  }
  chrome.storage.local.set(storage_obj)
}


function applyConfiguredTimeRange(e) {
  app.current.from = app.configured.from;
  app.current.to = app.configured.to;
  chrome.tabs.sendMessage(tabId, {
    type: "apply",
    from: app.configured.from,
    to: app.configured.to
  });
}

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
        var storage_object = items[hostname];
        if(storage_object?.configured){
          app.configured = storage_object.configured;
        }
        if (storage_object?.configured) {
          app.stored = storage_object.stored;
        }
      }
      document.getElementById("store_current_timerange").addEventListener(
        "click", {
          handleEvent: setCongifuredTimeRange
        })
      document.getElementById("apply_configured_timerange").addEventListener(
        "click", {
          handleEvent: applyConfiguredTimeRange
        })
    })
  });
});