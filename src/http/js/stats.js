function convertPlaysToTableFormat(plays) {
    var map = {};
    var videoDisplayBase = "<a href='https://www.youtube.com/watch?v={{videoID}}'>{{title}}</a>"; // TODO support soundcloud

    for (var i = 0; i < plays.length; i++) {
        var play = plays[i];
        if (!map[play.videoID]) {
            map[play.videoID] = {
                knownPlayIDs: [],
                downdubs: 0,
                plays: 0,
                title: videoDisplayBase.replace("{{videoID}}", play.videoID).replace("{{title}}", play.title),
                updubs: 0
            };
        }

        // Make sure this play hasn't been seen previously
        if ($.inArray(play.playID, map[play.videoID].knownPlayIDs) < 0) {
            map[play.videoID].knownPlayIDs.push(play.playID);
            map[play.videoID].plays++;
        }

        var vote = play.vote;

        if (vote === 1) {
            map[play.videoID].updubs++;
        }
        else if (vote === -1) {
            map[play.videoID].downdubs++;
        }
    }

    var rows = [];

    for (var key in map) {
        var data = map[key];
        rows.push([
            data.title,
            data.plays,
            data.updubs,
            data.downdubs
        ]);
    }

    return rows;
}

function createPieCharts(incomingVotes, outgoingVotes) {
    // Create pie chart for number of incoming votes
    new d3pie("incomingVotesPieChart", {
        "size": {
            "canvasHeight": 200,
            "canvasWidth": 200,
            "pieOuterRadius": "100%"
        },
        "data": {
            "sortOrder": "value-desc",
            "content": [
                {
                    "label": "Updubs",
                    "value": incomingVotes.updubs,
                    "color": "#90ad2f"
                },
                {
                    "label": "Downdubs",
                    "value": incomingVotes.downdubs,
                    "color": "#c42e3b"
                }
            ]
        },
        "labels": {
            "outer": {
                "format": "none",
                "pieDistance": 20
            },
            "inner": {
                "format": "label-percentage2",
                "hideWhenLessThanPercentage": 3
            },
            "mainLabel": {
                "color": "#ffffff",
                "fontSize": 12
            },
            "percentage": {
                "color": "#ffffff",
                "fontSize": 10,
                "decimalPlaces": 0
            },
            "value": {
                "color": "#888888",
                "fontSize": 11
            },
            "lines": {
                "enabled": true
            }
        },
        "tooltips": {
            "enabled": true,
            "type": "placeholder",
            "string": "{label}: {value}, {percentage}%"
        },
        "effects": {
            "pullOutSegmentOnClick": {
                "effect": "linear",
                "speed": 400,
                "size": 8
            }
        },
        "misc": {
            "gradient": {
                "enabled": false,
                "percentage": 100
            }
        }
    });

    // Create pie chart for number of outgoing votes
    new d3pie("outgoingVotesPieChart", {
        "size": {
            "canvasHeight": 200,
            "canvasWidth": 200,
            "pieOuterRadius": "100%"
        },
        "data": {
            "sortOrder": "value-desc",
            "content": [
                {
                    "label": "Updubs",
                    "value": outgoingVotes.updubs,
                    "color": "#90ad2f"
                },
                {
                    "label": "Downdubs",
                    "value": outgoingVotes.downdubs,
                    "color": "#c42e3b"
                }
            ]
        },
        "labels": {
            "outer": {
                "format": "none",
                "pieDistance": 20
            },
            "inner": {
                "format": "label-percentage2",
                "hideWhenLessThanPercentage": 3
            },
            "mainLabel": {
                "color": "#ffffff",
                "fontSize": 12
            },
            "percentage": {
                "color": "#ffffff",
                "fontSize": 10,
                "decimalPlaces": 0
            },
            "value": {
                "color": "#888888",
                "fontSize": 11
            },
            "lines": {
                "enabled": true
            }
        },
        "tooltips": {
            "enabled": true,
            "type": "placeholder",
            "string": "{label}: {value}, {percentage}%"
        },
        "effects": {
            "pullOutSegmentOnClick": {
                "effect": "linear",
                "speed": 400,
                "size": 8
            }
        },
        "misc": {
            "gradient": {
                "enabled": false,
                "percentage": 100
            }
        }
    });
}
