var p = require("./package.json")
var lv = require("livekit-client/package.json")
console.log("livekit-client version:", lv.version)
console.log("components-react version:", require("@livekit/components-react/package.json").version)
