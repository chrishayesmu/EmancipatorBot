var mysql = require("mysql");
var Log = require("dubbotbase").Log;

var LOG = new Log("MysqlDao");

var FIND_SIMILAR_USERS_SQL = "SELECT id, username FROM users WHERE username LIKE CONCAT('%', CONCAT(?, '%'))";
var GET_INCOMING_VOTES_FOR_USER_SQL = "SELECT mv.user_id AS userID, u.username AS username, mp.title AS videoTitle, mp.video_id AS videoID, mv.voted_on AS voteDate, vote FROM (media_votes mv JOIN media_plays mp USING (play_id)) JOIN users u ON u.id = mv.user_id WHERE mp.user_id = ?";
var GET_OUTGOING_VOTES_FOR_USER_SQL = "SELECT mp.user_id AS userID, u.username AS username, mp.title AS videoTitle, mp.video_id AS videoID, mv.voted_on AS voteDate, vote FROM (media_votes mv JOIN media_plays mp USING (play_id)) JOIN users u ON u.id = mp.user_id WHERE mv.user_id = ?";
var GET_NUMBER_OF_DISTINCT_PLAYS_FOR_USER_SQL = "SELECT COUNT(DISTINCT video_id) AS num_plays FROM media_plays WHERE user_id = ?";
var GET_NUMBER_OF_PLAYS_FOR_USER_SQL = "SELECT COUNT(*) AS num_plays FROM media_plays WHERE user_id = ?";
var GET_PLAYS_FOR_USER_SQL = "SELECT mp.play_id AS playID, mp.video_id AS videoID, mp.title, mp.duration AS durationInSeconds, mp.played_on AS playDate, mv.user_id AS votingUserID, mv.voted_on AS votingDate, mv.vote FROM media_plays mp LEFT JOIN media_votes mv USING (play_id) WHERE mp.user_id = ?";
var GET_USER_SQL = "SELECT id, username FROM users WHERE id = ?";
var INSERT_MEDIA_PLAY_SQL = "INSERT INTO media_plays (video_id, user_id, title, duration, played_on) VALUES (?, ?, ?, ?, ?)";
var INSERT_MEDIA_VOTE_SQL = "REPLACE INTO media_votes (play_id, user_id, vote) VALUES (?, ?, ?)";
var INSERT_USER_SQL = "INSERT IGNORE INTO users (id, username) VALUES (?, ?)";

var connectionPool = null;

function MysqlDao(config) {
    if (!config) throw Error("Missing value for 'config' argument");
    if (!config.host) throw Error("Missing value for config.host");
    if (!config.user) throw Error("Missing value for config.user");
    if (!config.password) throw Error("Missing value for config.password");
    if (!config.database) throw Error("Missing value for config.database");

    if (!connectionPool) {
        connectionPool = mysql.createPool({
            connectionLimit: config.connectionLimit || 20,
            ssl: config.ssl || "Amazon RDS",
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database
        });
    }

    this.isReadOnly = !!config.isReadOnly;
}

function getConnection(callback) {
    connectionPool.getConnection(function(err, connection) {
        if (err) {
            LOG.error("Error occurred when trying to get connection", err);
            return;
        }

        callback(connection);
    });
}

/**
 * Locates users with names "similar" to the one provided, where similar means that
 * the provided string is a substring of the user's name. No effort is made to rank
 * names based on how similar they are. This method is case-insensitive.
 *
 * @param {string} username - The username to find similar names for
 * @returns {array[User]} - The users with names similar to the provided
 */
MysqlDao.prototype.findUsersWithSimilarName = function(username) {
    return new Promise(function(resolve, reject) {
        getConnection(function(connection) {
            connection.query(FIND_SIMILAR_USERS_SQL, [username], function(err, rows) {
                connection.release();

                if (err) {
                    LOG.error("An error occurred while querying for users with names similar to {}: {}", username, err);
                    reject(err);
                    return;
                }

                var arr = rows.map(function(row) {
                    return {
                        userID: row.id,
                        username: row.username
                    };
                });

                resolve(arr);
            });
        });
    });
};

/**
 * Retrieves the votes a user has had cast on their songs, along with some aggregate data.
 *
 * @param {integer} userID - The ID of the user to look up
 * @returns {Promise} A promise for an object in the form
 *
 * {
 *     woots: 123,
 *     mehs: 321,
 *     votes: [
 *          {
 *              userID: 6017451,
 *              username: "beefy",
 *              videoID: "Jz8c17upEwM",
 *              videoTitle: "Bastion - Build That Wall",
 *              voteDate: "2015-04-25 05:02:09",
 *              vote: 1
 *          },
 *          ...
 *     ]
 * }
 */
MysqlDao.prototype.getIncomingVotesForUser = function(userID) {
    return new Promise(function(resolve, reject) {
        getConnection(function(connection) {
            connection.query(GET_INCOMING_VOTES_FOR_USER_SQL, [userID], function(err, rows) {
                connection.release();

                if (err) {
                    LOG.error("An error occurred while querying for incoming votes for userID={}: {}", userID, err);
                    reject(err);
                    return;
                }

                var obj = { updubs: 0, downdubs: 0, votes: rows };

                rows.forEach(function(vote) {
                    if (vote.vote === 1) {
                        obj.updubs++;
                    }
                    else {
                        obj.downdubs++;
                    }
                });

                resolve(obj);
            });
        });
    });
};

/**
 * Gets the total number of times the user has played a song in the room.
 *
 * @param {integer} userID - The ID of the user to look up
 * @returns {Promise} A promise for the number of plays the user has
 */
MysqlDao.prototype.getNumberOfPlaysByUser = function(userID) {
    return new Promise(function(resolve, reject) {
        getConnection(function(connection) {
            connection.query(GET_NUMBER_OF_PLAYS_FOR_USER_SQL, [userID], function(err, rows) {
                connection.release();

                if (err) {
                    LOG.error("An error occurred while querying for number of plays by userID={}: {}", userID, err);
                    reject(err);
                    return;
                }

                if (rows && rows.length > 0) {
                    resolve(rows[0].num_plays);
                }
                else {
                    resolve(0);
                }
            });
        });
    });
};

/**
 * Gets the total number of distinct videos the user has played in the room.
 *
 * @param {integer} userID - The ID of the user to look up
 * @returns {Promise} A promise for the number of unique plays the user has
 */
MysqlDao.prototype.getNumberOfDistinctPlaysByUser = function(userID) {
    return new Promise(function(resolve, reject) {
        getConnection(function(connection) {
            connection.query(GET_NUMBER_OF_DISTINCT_PLAYS_FOR_USER_SQL, [userID], function(err, rows) {
                connection.release();

                if (err) {
                    LOG.error("An error occurred while querying for number of distinct plays by userID={}: {}", userID, err);
                    reject(err);
                    return;
                }

                if (rows && rows.length > 0) {
                    resolve(rows[0].num_plays);
                }
                else {
                    resolve(0);
                }
            });
        });
    });
};

/**
 * Gets the complete play history for the user, complete with votes cast on those plays.
 *
 * @param {integer} userID - The ID of the user to look up
 * @returns {Promise} A promise for the play history of the user
 */
MysqlDao.prototype.getPlaysByUser = function(userID) {
    return new Promise(function(resolve, reject) {
        getConnection(function(connection) {
            connection.query(GET_PLAYS_FOR_USER_SQL, [userID], function(err, rows) {
                connection.release();

                if (err) {
                    LOG.error("An error occurred while querying for play history by userID={}: {}", userID, err);
                    reject(err);
                    return;
                }

                resolve(rows);
            });
        });
    });
};

/**
 * Retrieves the votes a user has cast, along with some aggregate data.
 *
 * @param {integer} userID - The ID of the user to look up
 * @returns {Promise} A promise for an object in the form
 *
 * {
 *     woots: 123,
 *     mehs: 321,
 *     votes: [
 *          {
 *              userID: 6017451,
 *              username: "beefy",
 *              videoID: "Jz8c17upEwM",
 *              videoTitle: "Bastion - Build That Wall",
 *              voteDate: "2015-04-25 05:02:09",
 *              vote: 1
 *          },
 *          ...
 *     ]
 * }
 */
MysqlDao.prototype.getVotesCastByUser = function(userID) {
    return new Promise(function(resolve, reject) {
        getConnection(function(connection) {
            connection.query(GET_OUTGOING_VOTES_FOR_USER_SQL, [userID], function(err, rows) {
                connection.release();

                if (err) {
                    LOG.error("An error occurred while querying for votes cast by userID={}: {}", userID, err);
                    reject(err);
                    return;
                }

                var obj = { updubs: 0, downdubs: 0, votes: rows };

                rows.forEach(function(vote) {
                    if (vote.vote === 1) {
                        obj.updubs++;
                    }
                    else {
                        obj.downdubs++;
                    }
                });

                resolve(obj);
            });
        });
    });
};

/**
 * Retrieves a user from the database. Collects only minimal data:
 * the user's ID and username.
 *
 * @param {integer} userID - The ID of the user to look up
 * @returns {Promise} A promise for the user's information
 */
MysqlDao.prototype.getUser = function(userID) {
    return new Promise(function(resolve, reject) {
        getConnection(function(connection) {
            connection.query(GET_USER_SQL, [userID], function(err, rows) {
                connection.release();

                if (err) {
                    LOG.error("An error occurred while querying userID={}: {}", userID, err);
                    reject(err);
                    return;
                }

                if (!rows || rows.length === 0) {
                    LOG.info("No user found for userID={}", userID);
                    resolve(null);
                    return;
                }

                var obj = {
                    userID: rows[0].id,
                    username: rows[0].username
                };

                resolve(obj);
            });
        });
    });
};

/**
 * Inserts a media play record to the database.
 *
 * @param {object} play - An object with properties 'videoID', 'userID', 'title', 'playedOn' and 'duration'
 * @returns {Promise} A Promise for an object with a lastID property representing the row added
 */
MysqlDao.prototype.insertMediaPlay = function(play) {
    if (this.isReadOnly) {
        LOG.info("DAO is in read-only mode, not inserting media play");
        return Promise.resolve(1);
    }

    LOG.info("Attempting to insert media play: {}", play);
    return new Promise(function(resolve, reject) {
        getConnection(function(connection) {
            connection.query(INSERT_MEDIA_PLAY_SQL, [play.videoID, play.userID, play.title, play.duration, play.playedOn], function(err, result) {
                connection.release();

                if (err) {
                    LOG.info("Error occurred when inserting media play {}. The error: {}", play, err);
                    reject(err);
                }
                else {
                    LOG.info("Successfully inserted media play: {}", play);
                    resolve(result.insertId);
                }
            });
        });
    });
};

/**
 * Upserts a media vote record to the database. (If it already exists, it will be updated; otherwise it will be inserted.)
 *
 * @param {object} vote - An object with properties 'playId', 'userId', and 'vote'
 * @returns {Promise} A Promise for an object with a 'lastID' property representing the row added, if new, or a 'changes' property if updated
 */
MysqlDao.prototype.upsertMediaVote = function(vote) {
    if (this.isReadOnly) {
        LOG.info("DAO is in read-only mode, not upserting media vote");
        return Promise.resolve(1);
    }

    LOG.info("Attempting to upsert media vote: {}", vote);
    return new Promise(function(resolve, reject) {
        getConnection(function(connection) {
            connection.query(INSERT_MEDIA_VOTE_SQL, [vote.playID, vote.userID, vote.vote], function(err, result) {
                connection.release();

                if (err) {
                    LOG.info("Error occurred when upserting media vote {}. The error: {}", vote, err);
                    reject(err);
                }
                else {
                    LOG.info("Successfully upserted media vote: {}", vote);
                    resolve(result.insertId);
                }
            });
        });
    });
};

/**
 * Upserts a user record to the database. (If it already exists, it will be updated; otherwise it will be inserted.)
 *
 * @param {object} user - An object with properties 'userID' and 'username'
 * @returns {Promise} A Promise for an object with a lastID property representing the row added, if new, or a 'changes' property if updated
 */
MysqlDao.prototype.upsertUser = function(user) {
    if (this.isReadOnly) {
        LOG.info("DAO is in read-only mode, not upserting user");
        return Promise.resolve(1);
    }

    LOG.info("Attempting to upsert user: {}", user);
    return new Promise(function(resolve, reject) {
        getConnection(function(connection) {
            connection.query(INSERT_USER_SQL, [user.userID, user.username], function(err, result) {
                connection.release();

                if (err) {
                    LOG.info("Error occurred when upserting user {}. The error: {}", user, err);
                    reject(err);
                }
                else {
                    LOG.info("Successfully upserted user: {}", user);
                    resolve(result.insertId);
                }
            });
        });
    });
};

module.exports = MysqlDao;
