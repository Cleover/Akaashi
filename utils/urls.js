const fetch = require('node-fetch');

module.exports = function () {
    this.checkURL = function (url) {
        return ((url.match(/\.(jpeg|jpg|gif|png)$/) != null) && (url.match(/imgur.com/g) != null))
    }

    this.getSize = function (url) {
        return fetch(url).then(response => {
            return Math.ceil(response.headers.get("content-length")/ 1024)
        })
    }
}