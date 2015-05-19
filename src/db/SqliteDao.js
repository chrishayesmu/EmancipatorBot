require("es6-promise");
var sqlite3 = require("sqlite3");

var Log = require("plugbotbase").Log;

var LOG = new Log("SqliteDao");
var INSTANCE = null;

var CREATE_TABLE_USERS_SQL = "CREATE TABLE users (\n"
                           + "    id VARCHAR(30) NOT NULL PRIMARY KEY,\n"
                           + "    username VARCHAR(100) NOT NULL\n"
                           + ");";

var CREATE_TABLE_MEDIA_PLAYS_SQL = "CREATE TABLE media_plays (\n"
                                 + "    play_id INTEGER NOT NULL PRIMARY KEY,\n"
                                 + "    user_id VARCHAR(30) NOT NULL,\n"
                                 + "    video_id VARCHAR(15) NOT NULL,\n"
                                 + "    title VARCHAR(200) NOT NULL,\n"
                                 + "    duration INTEGER NOT NULL,\n"
                                 + "    played_on datetime NOT NULL\n"
                                 + ");";

var CREATE_TABLE_MEDIA_VOTES_SQL = "CREATE TABLE media_votes (\n"
                                 + "    user_id VARCHAR(30) NOT NULL,\n"
                                 + "    play_id VARCHAR(15) NOT NULL,\n"
                                 + "    vote TINYINT NOT NULL,\n"
                                 + "    voted_on datetime NOT NULL DEFAULT current_timestamp,\n"
                                 + "    FOREIGN KEY (user_id) REFERENCES users(user_id),\n"
                                 + "    FOREIGN KEY (play_id) REFERENCES media_plays(play_id),\n"
                                 + "    PRIMARY KEY (user_id, play_id),\n"
                                 + "    CONSTRAINT chk_vote CHECK (vote == 1 OR vote == -1)\n"
                                 + ");";

var INSERT_MEDIA_PLAY_SQL = "INSERT INTO media_plays (video_id, user_id, title, duration, played_on) VALUES (?, ?, ?, ?, ?)";
var INSERT_MEDIA_VOTE_SQL = "INSERT OR REPLACE INTO media_votes (play_id, user_id, vote) VALUES (?, ?, ?)";
var INSERT_USER_SQL = "INSERT OR REPLACE INTO users (id, username) VALUES (?, ?)";

/**
 * Retrieves a singleton instance of the DAO.
 *
 * @param {string} dbFilePath - The path to where the database file should be stored
 * @returns {object} An instance of the DAO
 */
function getInstance(dbFilePath) {
    if (!dbFilePath || typeof dbFilePath !== "string") {
        throw new Error("getInstance was called without a String argument");
    }

    if (!INSTANCE) {
        INSTANCE = new SqliteDao(dbFilePath);
    }

    return INSTANCE;
}

/**
 * Constructs an instance of the DAO. Prepares SQL statements and performs checks to
 * ensure the database file exists and has the proper tables in it. If not, the file
 * will be created and populated with the necessary tables.
 *
 * @param {string} dbFilePath - The path to where the database file should be stored
 * @returns {object} An instance of the DAO
 */
function SqliteDao(dbFilePath) {
    var INSERT_MEDIA_PLAY_STATEMENT;
    var INSERT_MEDIA_VOTE_STATEMENT;
    var INSERT_USER_STATEMENT;

    LOG.info("Attempting to create new DAO with database file path {}", dbFilePath);

    var dbPromise = _createDatabase(dbFilePath, sqlite3.OPEN_READWRITE).catch(function(err) {
        LOG.info("Initial database creation failed; trying again by creating a new database file");

        return _createDatabase(dbFilePath, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE).then(function(db) {
            var createUsersPromise = new Promise(function(resolve, reject) {
                db.run(CREATE_TABLE_USERS_SQL, function() { resolve(db); });
            });

            var createMediaPlaysPromise = new Promise(function(resolve, reject) {
                db.run(CREATE_TABLE_MEDIA_PLAYS_SQL, function() { LOG.info("{}", arguments); resolve(db); });
            });

            var createMediaVotesPromise = new Promise(function(resolve, reject) {
                db.run(CREATE_TABLE_MEDIA_VOTES_SQL, function() { resolve(db); });
            });

            return createUsersPromise.then(createMediaPlaysPromise).then(createMediaVotesPromise);
        });
    }).then(function(db) {
        INSERT_MEDIA_PLAY_STATEMENT = db.prepare(INSERT_MEDIA_PLAY_SQL);
        INSERT_MEDIA_VOTE_STATEMENT = db.prepare(INSERT_MEDIA_VOTE_SQL);
        INSERT_USER_STATEMENT = db.prepare(INSERT_USER_SQL);
        LOG.info("DAO created successfully");
    });

    /**
     * Inserts a media play record to the database.
     *
     * @param {object} play - An object with properties 'videoID', 'userID', 'title', 'playedOn' and 'duration'
     * @returns {Promise} A Promise for an object with a lastID property representing the row added
     */
    this.insertMediaPlay = function(play) {
        LOG.info("Attempting to insert media play: {}", play);
        return dbPromise.then(function(db) {
            return new Promise(function(resolve, reject) {
                INSERT_MEDIA_PLAY_STATEMENT.run([play.videoID, play.userID, play.title, play.duration, play.playedOn], function(err) {
                    if (err) {
                        LOG.info("Error occurred when inserting media play {}. The error: {}", play, err);
                        reject(err);
                    }
                    else {
                        LOG.info("Successfully inserted media play: {}", play);
                        resolve(this);
                    }
                });
            });
        });
    }

    /**
     * Upserts a media vote record to the database. (If it already exists, it will be updated; otherwise it will be inserted.)
     *
     * @param {object} vote - An object with properties 'playId', 'userId', and 'vote'
     * @returns {Promise} A Promise for an object with a 'lastID' property representing the row added, if new, or a 'changes' property if updated
     */
    this.upsertMediaVote = function(vote) {
        LOG.info("Attempting to upsert media vote: {}", vote);
        return dbPromise.then(function(db) {
            return new Promise(function(resolve, reject) {
                INSERT_MEDIA_VOTE_STATEMENT.run([vote.playID, vote.userID, vote.vote], function(err) {
                    if (err) {
                        LOG.info("Error occurred when upserting media vote {}. The error: {}", vote, err);
                        reject(err);
                    }
                    else {
                        LOG.info("Successfully upserted media vote: {}", vote);
                        resolve(this);
                    }
                });
            });
        });
    }

    /**
     * Upserts a user record to the database. (If it already exists, it will be updated; otherwise it will be inserted.)
     *
     * @param {object} user - An object with properties 'userID' and 'username'
     * @returns {Promise} A Promise for an object with a lastID property representing the row added, if new, or a 'changes' property if updated
     */
    this.upsertUser = function(user) {
        LOG.info("Attempting to upsert user: {}", user);
        return dbPromise.then(function(db) {
            return new Promise(function(resolve, reject) {
                INSERT_USER_STATEMENT.run([user.userID, user.username], function(err) {
                    if (err) {
                        LOG.info("Error occurred when upserting user {}. The error: {}", user, err);
                        reject(err);
                    }
                    else {
                        LOG.info("Successfully upserted user: {}", user);
                        resolve(this);
                    }
                });
            });
        });
    }
}

/**
 * Creates a Sqlite3 Database and wraps it in a Promise.
 *
 * @param {string} dbFilePath - Path to the database file to open or create
 * @param {integer} openMode - A bit flag composed of the Sqlite3 database opening mode constants
 * @returns {Promise} A Promise for the database object, which will reject if the database creation fails
 */
function _createDatabase(dbFilePath, openMode) {
    return new Promise(function(resolve, reject) {
        var db = new sqlite3.Database(dbFilePath, openMode, function(err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(db);
            }
        });
    });
}

exports.getInstance = getInstance;
