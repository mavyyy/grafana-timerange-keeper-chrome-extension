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
  var response = {
    isGrafanaWindow: isGrafanaWindow
  }
  if (isGrafanaWindow) {
    if (message.type === "popup") {
      response.hostname = document.location.hostname
      response.current = {
        from:null,
        to:null
      }
      var queryString = document.location.search;
      var queryParams = new URLSearchParams(queryString);
      // set parameters in local storage
      if (queryParams.has("to")) {
        response.current.to = parseTimeParam(queryParams.get("to"), "to");
      }
      if (queryParams.has("from")) {
        response.current.from = parseTimeParam(queryParams.get("from"), "from");
      }
      sendResponse(response);
    } else if (message.type === "apply") {
      var queryString = document.location.search;
      var params = new URLSearchParams(queryString);
      params.set("from", message.from)
      params.set("to", message.to)
      location.replace(
        location.origin +
        location.pathname +
        "?" +
        params.toString()
      )
    }
  } else {
    sendResponse(response);
  }
  return true;
})