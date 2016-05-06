CREATE TABLE IF NOT EXISTS users (
    id          VARCHAR(30)     NOT NULL    PRIMARY KEY,
    username    VARCHAR(100)    NOT NULL
);

CREATE TABLE IF NOT EXISTS media_plays (
    play_id     INTEGER         NOT NULL    AUTO_INCREMENT  PRIMARY KEY,
    user_id     VARCHAR(30)     NOT NULL,
    video_id    VARCHAR(15)     NOT NULL,
    title       VARCHAR(200)    NOT NULL,
    duration    INTEGER         NOT NULL,
    played_on   DATETIME        NOT NULL
);

CREATE TABLE IF NOT EXISTS media_votes (
    play_id     INTEGER         NOT NULL,
    user_id     VARCHAR(30)     NOT NULL,
    vote        INTEGER         NOT NULL,
    voted_on    DATETIME        NOT NULL    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, play_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (play_id) REFERENCES media_plays(play_id),
    CONSTRAINT chk_vote CHECK (vote = 1 OR vote = -1)
);
