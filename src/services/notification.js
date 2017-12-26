
function notify (title, message, timeout) {
    
    var notification = new Notification(title, {
        icon: "style/spanner-hammer.png",
        body: message
    });
    
    setTimeout(function () {
        notification.close();
    }, timeout || 4000);
}

function create () {
    return {
        notify: notify
    };
}

module.exports = create;
