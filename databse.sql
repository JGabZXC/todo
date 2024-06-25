DROP TABLE todo_main CASCADE;
DROP TABLE todo_side CASCADE;

CREATE TABLE todo_main (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE todo_side (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255),
    todo_id INTEGER REFERENCES todo_main(id)
);

INSERT INTO todo_main (name) VALUES ('Today');
INSERT INTO todo_side (description, todo_id) VALUES ('Fixed Database', 1);

INSERT INTO todo_side (description, todo_id) VALUES ('test2', 20);
INSERT INTO todo_side (description, todo_id) VALUES ('test3', 20);
INSERT INTO todo_side (description, todo_id) VALUES ('test1', 20);
INSERT INTO todo_side (description, todo_id) VALUES ('test4', 20);
INSERT INTO todo_side (description, todo_id) VALUES ('test5', 20);
INSERT INTO todo_side (description, todo_id) VALUES ('test6', 20);
INSERT INTO todo_side (description, todo_id) VALUES ('test7', 20);
INSERT INTO todo_side (description, todo_id) VALUES ('test8', 20);
INSERT INTO todo_side (description, todo_id) VALUES ('test9', 20);