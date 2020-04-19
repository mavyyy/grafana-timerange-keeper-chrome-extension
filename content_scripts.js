chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var isGrafanaWindow = document.body.classList.contains("app-grafana")
  var msg = {
    isGrafanaWindow: isGrafanaWindow
  }
  if (isGrafanaWindow) {
    if (message.type === "popup") {
      // response will be only hostname and flag
      // detailed parameters should be passed as chrome extension local storage
      var hostname = document.location.hostname
      chrome.storage.local.get([hostname], function (items) {
        var storage_obj_body = {}
        if (items[hostname]) {
          Object.assign(storage_obj_body, items[hostname]);
        }
        var queryString = document.location.search;
        var params = new URLSearchParams(queryString);
        // set parameters in local storage
        if (params.has("to")) {
          storage_obj_body.current_to = params.get("to");
        }else{
          storage_obj_body.current_to = null;
        }
        if (params.has("from")) {
          storage_obj_body.current_from = params.get("from");
        }else{
          storage_obj_body.current_from = null;
        }
        var storage_obj = {};
        storage_obj[hostname] = storage_obj_body;
        chrome.storage.local.set(storage_obj);
        // set hostname in response msg
        msg.hostname = hostname;
        sendResponse(msg);
      })
    } else if (message.type === "apply") {
      var queryString = document.location.search;
      var params = new URLSearchParams(queryString);
      params.set("from",message.params.from)
      params.set("to",message.params.to)
      location.replace(
        location.origin
        +location.pathname
        +"?"
        + params.toString()
      )
    }
  } else {
    sendResponse(msg);
  }
  return true;
});