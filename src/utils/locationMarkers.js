
var MARKER_PATTERN = /<([^>]+)>@([0-9]+)/g;

function parseLocationMarkers(text) {
    
    var markers = [];
    
    text.replace(MARKER_PATTERN, function (match, file, line) {
        
        markers.push({
            file: file,
            line: parseInt(line, 10)
        });
        
        return match;
    });
    
    return markers;
}

function insertLocationLinks(text) {
    return text.replace(
        MARKER_PATTERN,
        '<a class="location-link" data-type="locationLink" data-file="$1" data-line="$2">' +
            '&lt;$1&gt;@$2' +
        '</a>'
    );
}

module.exports = {
    parse: parseLocationMarkers,
    insert: insertLocationLinks
};
