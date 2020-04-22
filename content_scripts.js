function roundMilliseconds(num) {
  return Math.floor(num / 1000) * 1000;
}

function parseTimeParam(time, type) {
  if (!Number.isNaN(parseInt(time))) {
    return time;
  }
  if (time === "now") {
    return roundMilliseconds(Date.now()).toString()
  }
  if (matchResult = /now\-(\d+)([smhdwMy])/.exec(time)) {
    var quantity = parseInt(matchResult[1]);
    var unit = matchResult[2];
    var result = new Date();
    switch (matchResult[2]) {
      case "s":
        result.setSeconds(result.getSeconds() - quantity);
        break;
      case "m":
        result.setMinutes(result.getMinutes() - quantity);
        break;
      case "h":
        result.setHours(result.getHours() - quantity);
        break;
      case "d":
        result.setDate(result.getDate() - quantity);
        break;
      case "w":
        result.setDate(result.getDate() - quantity * 7);
        break;
      case "M":
        result.setMonth(result.getMonth() - quantity * 7);
        break;
      case "y":
        result.setFullYear(result.getFullYear() - quantity);
        break;

      default:
        break;
    }
    return roundMilliseconds(result.getTime()).toString()
  }
  return null;
}

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
          storage_obj_body.current_to = parseTimeParam(params.get("to"),"to");
        }else{
          storage_obj_body.current_to = null;
        }
        if (params.has("from")) {
          storage_obj_body.current_from = parseTimeParam(params.get("from"),"from");
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