function getButtonRounding() {
    const cornerRadiusCounts = {};
    let mostCommonRadius = null;
    let maxCount = 0;

    $('a').each(function() {
      const cornerRadius = parseInt($(this).css('border-radius'));
      cornerRadiusCounts[cornerRadius] = (cornerRadiusCounts[cornerRadius] || 0) + 1;

      if (cornerRadius > 0) {
        if (cornerRadiusCounts[cornerRadius] > maxCount) {
          mostCommonRadius = cornerRadius;
          maxCount = cornerRadiusCounts[cornerRadius];
        }
      } else if (mostCommonRadius === null) {
        mostCommonRadius = 0;
        maxCount = 1;
      }
    });

    window.buttonRadius = mostCommonRadius ?? 50
}

function toast(text, type = "info", callback = null) {
  const timeout = 3000
  const icon = $("<div>").addClass("toast__icon")

  const check = $("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"15.007\" height=\"10.72\" viewBox=\"0 0 15.007 10.72\"><path d=\"M8.566-9.31a1.073,1.073,0,0,1,0,1.517L-.008.781a1.073,1.073,0,0,1-1.517,0L-5.813-3.506a1.073,1.073,0,0,1,0-1.517,1.073,1.073,0,0,1,1.517,0L-.765-1.5,7.052-9.31a1.073,1.073,0,0,1,1.517,0Z\" transform=\"translate(6.127 9.624)\" fill=\"currentColor\"/></svg>");
  const triangle = $("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"17.147\" height=\"15.006\" viewBox=\"0 0 17.147 15.006\"><path d=\"M1.574-11.375a1.337,1.337,0,0,1,1.156.663L9.965,1.614A1.339,1.339,0,0,1,8.809,3.63H-5.66a1.342,1.342,0,0,1-1.162-.673,1.345,1.345,0,0,1,.007-1.343L.419-10.712a1.337,1.337,0,0,1,1.156-.663Zm0,4.287a.8.8,0,0,0-.8.8v3.751a.8.8,0,0,0,.8.8.8.8,0,0,0,.8-.8V-6.284A.8.8,0,0,0,1.574-7.088ZM2.646.415A1.072,1.072,0,1,0,1.574,1.487,1.072,1.072,0,0,0,2.646.415Z\" transform=\"translate(6.999 11.375)\" fill=\"currentColor\"/></svg>");
  const info = $("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"17.964\" height=\"17.338\" viewBox=\"0 0 17.964 17.338\"><path d=\"M15.578,27.2a1.439,1.439,0,0,0,.984-.511l2.846-2.556H24.3a3.334,3.334,0,0,0,3.648-3.64V14.519A3.342,3.342,0,0,0,24.3,10.863H14.632a3.345,3.345,0,0,0-3.648,3.655v5.975a3.336,3.336,0,0,0,3.564,3.64h.267v2.213A.756.756,0,0,0,15.578,27.2ZM19.447,15.16a1.057,1.057,0,0,1,0-2.114,1.057,1.057,0,0,1,0,2.114Zm-1.29,6.395a.605.605,0,0,1-.633-.618.618.618,0,0,1,.633-.611h.855V17.472h-.717a.615.615,0,1,1,0-1.229h1.412c.458,0,.694.313.694.794v3.289h.748a.617.617,0,0,1,.633.611.605.605,0,0,1-.633.618Z\" transform=\"translate(-10.484 -10.363)\" fill=\"currentColor\"/></svg>");

  switch (type) {
    case "success": icon.append(check); break;
    case "warning" || "error": icon.append(triangle); break;
    default: icon.append(info);
  }

  const p = $("<p>")
    .addClass("toast__text")
    .text(text)

  const toast = $("<div>")
    .addClass("toast")
    .css("border-radius", window.buttonRadius)
    .addClass(type);

  toast.append(icon)
  toast.append(p)

  let action
  if (callback && typeof callback === "function") {
    action = $("<a><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12.863\" height=\"11.031\" viewBox=\"0 0 12.863 11.031\"><path d=\"M7.344-2.838a.92.92,0,0,0,0-1.3L2.75-8.733a.92.92,0,0,0-1.3,0,.92.92,0,0,0,0,1.3L4.478-4.405h-8.81a.918.918,0,0,0-.919.919.918.918,0,0,0,.919.919H4.476L1.452.459a.92.92,0,0,0,1.3,1.3L7.347-2.835Z\" transform=\"translate(5.25 9.002)\" fill=\"currentColor\"/></svg></a>").addClass("toast__button").css("border-radius", (window.buttonRadius * 1.25));
    action.on("click", function(){callback()})
  }
  else {
    action = $("<a><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12.863\" height=\"12.863\" viewBox=\"0 0 12.863 12.863\"><path d=\"M8.731-6.055a1.288,1.288,0,0,0,0-1.82,1.288,1.288,0,0,0-1.82,0L2.68-3.64-1.555-7.871a1.288,1.288,0,0,0-1.82,0,1.288,1.288,0,0,0,0,1.82L.86-1.82-3.371,2.415a1.288,1.288,0,0,0,0,1.82,1.288,1.288,0,0,0,1.82,0L2.68,0,6.915,4.231a1.287,1.287,0,0,0,1.82-1.82L4.5-1.82,8.731-6.055Z\" transform=\"translate(3.752 8.252)\" fill=\"currentColor\"/></svg></a>").addClass("toast__button").css("border-radius", (window.buttonRadius * 1.25));
    action.on("click", function(){
      toast.removeClass("launch");
      setTimeout(function () {
        toast.remove();
      }, 350);
    })
  }
  toast.append(action)
  $("body").append(toast);

  setTimeout(function () {
    toast.addClass("launch");

    setTimeout(function () {
      toast.removeClass("launch");

      setTimeout(function () {
        toast.remove();
      }, 350);
    }, timeout);
  }, 50);
}

$(document).ready(function(){
  getButtonRounding()
});
