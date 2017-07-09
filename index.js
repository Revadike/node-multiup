const request = require("request");
const fs = require("fs");
var user = -1;

module.exports = {
    login: function(username, password, callback) {
        request({
            url: "https://www.multiup.org/api/login",
            method: "POST",
            formData: {
                username: username,
                password: password
            }
        }, function(error, response, data) {
            var json;
            if (!error) {
                json = JSON.parse(data);
                if (json.error !== "success") {
                    error = json.error;
                } else {
                    user = json.user;
                }
                delete json.error;
            }
            callback(error, json);
        });
    },
    logout: function() {
        user = -1;
    },
    upload: function(file, hosts, description, callback) {
        if (hosts.length <= 13) {
            fs.stat(file, function(error) {
                if (error === null) {
                    request({
                        url: "https://www.multiup.org/api/get-fastest-server",
                        method: "GET"
                    }, function(error, response, data) {
                        if (!error) {
                            var json = JSON.parse(data);
                            if (json.error !== "success") {
                                callback(new Error(json.error));
                            } else {
                                var server = json.server;
                                var req = request.post(server, function(error, response, data) {
                                    var json;
                                    if (!error) {
                                        callback(null, JSON.parse(data));
                                    } else {
                                        callback(new Error("Failed to upload"));
                                    }
                                });
                                var form = req.form();
                                form.append("files[]", fs.createReadStream(file));
                                if (description) form.append("description", description.toString());
                                if (user !== -1) form.append("user", user.toString());
                                hosts.forEach(host => {
                                    form.append(host.toString(), "true");
                                });
                            }
                        } else {
                            callback(new Error("Unable to fetch available server"));
                        }
                    });
                } else {
                    callback(error);
                }
            });
        } else {
            callback(new Error("Please select max 13 hosts"));
        }
    }
};