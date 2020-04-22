function epochToStr(epoch){
  return new Date(parseInt(epoch)).toLocaleString()
}
var tabId = null;


const app = new Vue({
  el:"#app",
  data:{
    msg:{},
    params:{
      current_from:"",
      current_to:"",
      configured_from:"",
      configured_to:""
    }
  },
  computed:{
    current_from:function(){
      return epochToStr(this.params.current_from);
    },
    current_to:function(){
      return epochToStr(this.params.current_to);
    },
    configured_from:function(){
      return epochToStr(this.params.configured_from);
    },
    configured_to:function(){
      return epochToStr(this.params.configured_to);
    }
  }
})



function setCongifuredTimeRange(e) {
  params.configured_from = this.from;
  params.configured_to = this.to;
  var storage_obj = {};
  storage_obj[app.msg.hostname] = params
  app.params.configured_from=this.from;
  app.params.configured_to=this.to;
  chrome.storage.local.set(storage_obj)
}


function applyConfiguredTimeRange(e) {
  params.current_from = this.from;
  params.current_to = this.to;
  var storage_obj = {};
  storage_obj[app.msg.hostname] = params;
  app.params.current_from = this.from;
  app.params.current_to = this.to;
  chrome.tabs.sendMessage(tabId, {
    type: "apply",
    params: {
      from: this.from,
      to: this.to
    }
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
    app.msg = response;
    if (!response.isGrafanaWindow) {
      return;
    }
    var hostname = response.hostname;
    chrome.storage.local.get(null, function (items) {
      if (items[hostname]) {
        params = items[hostname];
        keys = [
          "current_from",
          "current_to",
          "configured_from",
          "configured_to"
        ];
        for (let key of keys) {
          if (params[key]) {
            app.params[key] = params[key];
          }
        }
      }
      document.getElementById("store_current_timerange").addEventListener(
        "click", {
          handleEvent: setCongifuredTimeRange,
          from: params.current_from,
          to: params.current_to
        })
      document.getElementById("apply_configured_timerange").addEventListener(
        "click", {
          handleEvent: applyConfiguredTimeRange,
          from: params.configured_from,
          to: params.configured_to
        }
      )
    })
  });
});