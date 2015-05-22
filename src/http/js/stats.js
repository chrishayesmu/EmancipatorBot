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
                    "label": "Woots",
                    "value": incomingVotes.woots,
                    "color": "#90ad2f"
                },
                {
                    "label": "Mehs",
                    "value": incomingVotes.mehs,
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
                    "label": "Woots",
                    "value": outgoingVotes.woots,
                    "color": "#90ad2f"
                },
                {
                    "label": "Mehs",
                    "value": outgoingVotes.mehs,
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
