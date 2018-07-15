const req = require(`request`);
const fs = require(`fs`);

let user = -1;
const apihost = `https://multiup.org/api`;
const request = req.defaults({
    json: true
});

module.exports = {
    login: login,
    logout: logout,
    check: check,
    gethosts: gethosts,
    upload: upload
};

function login(username, password, callback) {
    if (user !== -1) {
        callback(new Error(`Already logged in!`));
        return;
    }

    request({
        url: `${apihost}/login`,
        method: `POST`,
        formData: {
            username: username,
            password: password
        }
    }, (error, response, data) => returnAPI(error, response, data, (error, json) => {
        if (error) {
            callback(error);
            return;
        }

        user = json.user;
        callback(null, user);
    }));
}

function logout() {
    user = -1;
}

function check(link, callback) {
    request({
        url: `${apihost}/check-file`,
        method: `POST`,
        formData: {
            link: link
        }
    }, (error, response, data) => returnAPI(error, response, data, callback));
}

function gethosts(callback) {
    request.get(`${apihost}/get-list-hosts`, (error, response, data) => returnAPI(error, response, data, callback));
}

function upload(file, hosts, description, callback) {
    const self = this;

    fs.stat(file, error => {
        if (error) {
            callback(new Error(`Could not read file: ${error.message}`));
            return;
        }

        self.gethosts((error, json) => {
            if (error) {
                callback(error);
                return;
            }

            if (json.maxHosts && hosts.length > json.maxHosts) {
                callback(new Error(`Exceeded max host limit (${json.maxHosts})`));
                return;
            }

            const invalidhosts = hosts.filter(host => !json.hosts.hasOwnProperty(host));
            if (invalidhosts.length > 0) {
                callback(new Error(`Invalid hosts: (${invalidhosts.join(`, `)})`));
                return;
            }

            request({
                url: `${apihost}/get-fastest-server`,
                method: `GET`
            }, (error, response, data) => returnAPI(error, response, data, (error, json) => {
                if (error) {
                    callback(new Error(`Unable to fetch available server: ${error.message}`));
                    return;
                }

                const server = json.server;
                const uploadreq = request.post(server, (error, response, data) => returnAPI(error, response, data, (error, json) => {
                    if (error) {
                        callback(new Error(`Failed to upload: ${error.message}`));
                        return;
                    }

                    if (!json.files || json.files.length === 0) {
                        callback(new Error(`No files were uploaded`));
                        return;
                    }

                    callback(null, json.files[0]);
                }));

                const form = uploadreq.form();
                form.append(`files[]`, fs.createReadStream(file));

                if (description) {
                    form.append(`description`, description.toString());
                }

                if (user !== -1) {
                    form.append(`user`, user.toString());
                }

                hosts.forEach(host => {
                    form.append(host.toString(), `true`);
                });
            }));
        });
    });
}

function returnAPI(error, response, json, callback) {
    if (!callback) {
        return;
    }

    if (error) {
        callback(error);
        return;
    }

    if (response && response.statusCode !== 200) {
        callback(new Error(`HTTP error ${response.statusCode}`));
        return;
    }

    if (typeof json !== `object`) {
        try {
            json = JSON.parse(json);
        } catch (error) {
            callback(new SyntaxError(`${error.message || error}: ${json}`));
            return;
        }
    }

    if (json.error && json.error !== `success`) {
        callback(new Error(json.error));
        return;
    }

    callback(null, json);
}