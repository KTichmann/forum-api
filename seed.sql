create table users (username varchar NOT NULL PRIMARY KEY, password varchar NOT NULL);
create table posts (post_id SERIAL PRIMARY KEY, username varchar NOT NULL, post VARCHAR(1500) NOT NULL, title VARCHAR(100) NOT NULL, created_at timestamp without time zone default (now() at time zone 'utc'));
create table comments (comment_id SERIAL PRIMARY KEY, comment VARCHAR(750) NOT NULL, username VARCHAR NOT NULL, post_id INT NOT NULL, created_at timestamp without time zone default (now() at time zone 'utc'));
create table likes (username VARCHAR NOT NULL, type VARCHAR NOT NULL, id INT);