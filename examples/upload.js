const multiup = require("../index.js");

multiup.login("USER", "PASSWORD", function(error, json) {
    console.log(error, json);
    multiup.upload(__dirname + "/test.txt", ["zippyshare.com"], "A test", console.log);
});