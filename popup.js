var msg = {}
var params = {}
var tabId = null

function epochToStr(epoch){
  return new Date(parseInt(epoch)).toLocaleString()
}

function setCongifuredTimeRange(e) {
  params.configured_from = this.from;
  params.configured_to = this.to;
  var storage_obj = {};
  storage_obj[msg.hostname] = params
  document.getElementById("configured_from_locale").innerText=epochToStr(this.from)
  document.getElementById("configured_to_locale").innerText=epochToStr(this.to)
  chrome.storage.local.set(storage_obj)
}

function applyConfiguredTimeRange(e) {
  params.current_from = this.from;
  params.current_to = this.to;
  var storage_obj = {};
  storage_obj[msg.hostname] = params;
  document.getElementById("current_from_locale").innerText=epochToStr(this.from)
  document.getElementById("current_to_locale").innerText=epochToStr(this.to)
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
    msg = response;
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
            document.getElementById(key + "_locale").innerText = epochToStr(params[key]);
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