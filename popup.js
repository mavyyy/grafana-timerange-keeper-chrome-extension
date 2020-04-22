function epochToStr(epoch){
  return new Date(parseInt(epoch)).toLocaleString()
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
  app.configured.from=app.current.from;
  app.configured.to=app.current.to;
  var storage_obj = {};
  storage_obj[app.hostname] = {
    configured:app.configured
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