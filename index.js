import express from "express";
import pg from "pg";
import bodyParser from "body-parser";

const app = new express();
const port = 3100;

const db = new pg.Client({
    user: "",
    host: "",
    database: "",
    password: "",
    port: 5432
});

db.connect();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes //
app.get('/get/name', async (req, res) => {
    try {
        const getName = await db.query('SELECT * FROM todo_main ORDER BY id ASC');
        
        if(getName.rows.length > 0) {
            res.json({
                message: "success",
                method: "get",
                result: getName.rows
            });
        } else {
            res.json({
                message: "no name was found",
                method: "get",
                result: getName.rows
            });
        }
        
    } catch (err) {
        console.error(err.message);
    }
});

// Get To Do by todo_id
app.get('/get/todo/:id', async (req, res) => {
    const id = req.params.id;
    const getName = await db.query('SELECT * FROM todo_main WHERE id = $1;', [id]);

    try {
        if(getName.rows.length > 0) {

            const getTodo = await db.query(
                'SELECT * FROM todo_side AS ts JOIN todo_main AS tm ON ts.todo_id = tm.id WHERE ts.todo_id = $1 ORDER BY ts.ts_id ASC', 
                [id]
            );

            if(getTodo.rows.length > 0) {
                res.json({
                    message: "success",
                    method: "get",
                    result: getTodo.rows
                }); 
            } else {
                res.json({
                    message: "no todo was retrieved",
                    method: "get",
                    result: getTodo.rows
                }); 
            }

        } else {
            res.json({
                message: "user doesn't exist",
                method: "get",
                result: []
            }); 
        }
    } catch (err) {
        console.error(err.message);
    }
});

// Create to do
app.post('/create/todo', async (req, res) => {
    try {
        const id = req.body[0].todoID;
        const newTod = req.body[0].newTODO;
        if(newTod !== '') {
            const insertTODO = await db.query('INSERT INTO todo_side (description, todo_id) VALUES ($1, $2)', [newTod, id]);
            if(insertTODO.rowCount > 0) {
                res.status(200).json({
                    message: "Successfully inserted",
                    method: "post"
                }); 
            } else {
                res.json({
                    message: "Data was not inserted",
                    method: "post"
                });
            }
            
        } else {
            res.json({
                message: "Cannot insert an empty string",
                method: "post"
            })
        }
    } catch (err) {
        console.error(err.message);
    }
});

// Delete to do by ts_id
app.delete('/delete/todo/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const checkTodo = await db.query('SELECT * FROM todo_side WHERE ts_id = $1', [id]);
        console.log(checkTodo.rows.length);
        if(checkTodo.rows.length > 0) {
            const chkTodoName = checkTodo.rows[0].description;
            const chkTodoID = checkTodo.rows[0].ts_id;
            await db.query('DELETE FROM todo_side WHERE ts_id = $1', [id]);
            res.json({
                message: `${chkTodoName}(${chkTodoID}) was successfully deleted`,
                method: 'delete'
            });
        } else {
            res.json({
                message: `No to do was found and none gets deleted`,
                method: 'delete'
            });
        }
    } catch (err) { 
        console.error(err.message);
    }
});

// Edit to do by ts_id
app.put('/edit/todo/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const newDescription = req.body[0].newDescription;
        const checkTodo = await db.query('SELECT * FROM todo_side WHERE ts_id = $1', [id]);
        if(checkTodo.rows.length > 0) {
            const chkTodoName = checkTodo.rows[0].description;
            const chkTodoID = checkTodo.rows[0].ts_id;
            await db.query('UPDATE todo_side SET description = $1 WHERE ts_id = $2', [newDescription, id]);
            res.json({
                message: `${chkTodoName}(${chkTodoID}) was successfully updated`,
                method: 'put'
            });
        } else {
            res.json({
                message: `No to do was found`,
                method: 'put'
            });
        }
    } catch (err) {
        console.error(err.message);
    }
});

// Create name 
app.post('/create/name', async (req, res) => {
    try {
        const name = req.body[0].name;
        
        if(name !== '') {
            const newN = await db.query('INSERT INTO todo_main (name) VALUES ($1) RETURNING *;', [name]);
            if(newN.rowCount > 0) {
                res.status(200).json({
                    message: `${name} successfully added`,
                    method: "post"
                });
            } else {
                res.json({
                    message: `${name} was not addeed`,
                    method: "post"
                });
            }
            
        } else {
            res.json({
                message: "Cannot enter empty string",
                method: "post"
            })
        }
        
    } catch (err) {
        console.error(err.message);
    }
});

// Edit name by id
app.put('/edit/name/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const {name} = req.body;

        const checkName = await db.query('SELECT * FROM todo_main WHERE id = $1', [id]);

        if(checkName.rows.length > 0) {
            const updated = await db.query('UPDATE todo_main SET name = $1 WHERE id = $2', [name, id]);
            console.log(updated.rows);
            res.status(200).json({
                message: 'success',
                method: 'put'
            })
        } else {
            res.status(500).json({
                message: `ID:${id} was not edited or the name was not in the database`,
                status: 0,
                method: "put"
            });
        }

    } catch (err) {
        console.error(err.message);
    }
});

// Delete name by id
app.delete('/delete/name/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const checkName = await db.query('SELECT * FROM todo_main WHERE id = $1', [id]);
        const chkName = checkName.rows[0].name;
        const chkID = checkName.rows[0].id;

        if(checkName.rows.length > 0) {

            await db.query('DELETE FROM todo_side WHERE todo_id = $1', [id]);
            await db.query('DELETE FROM todo_main WHERE id = $1', [id]);
            res.status(200).json({
                message: `${chkName}(${chkID}) was successfully deleted`,
                status: 1,
                method: "delete"
            });

        } else {
            res.status(500).json({
                message: `ID:${id} was not deleted or the name was not in the database`,
                status: 0,
                method: "delete"
            });
        }
        
    } catch (err) {
        console.log(err)
        console.error(err.message);
    }
});

app.get('/test/get/todo/:id', async (req, res) => {
    const id = req.params.id;
    const getName = await db.query('SELECT * FROM todo_main WHERE id = $1;', [id]);

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;
        if(getName.rows.length > 0) {

            const getTodo = await db.query(
                'SELECT * FROM todo_side AS ts JOIN todo_main AS tm ON ts.todo_id = tm.id WHERE ts.todo_id = $1 ORDER BY ts.ts_id ASC LIMIT $2 OFFSET $3', 
                [id, limit, offset]
            );
            const count = await db.query(
                'SELECT COUNT(*) FROM todo_side AS ts JOIN todo_main AS tm ON ts.todo_id = tm.id WHERE ts.todo_id = $1', 
                [id]
            );
            const total = Math.ceil(count.rows[0].count / limit);
            if(getTodo.rows.length > 0) {
                res.json({
                    message: "success",
                    method: "get",
                    result: getTodo.rows,
                    currentPage: page,
                    totalPages: total
                }); 
            } else {
                res.json({
                    message: "no todo was retrieved",
                    method: "get",
                    result: getTodo.rows,
                    currentPage: page,
                    totalPages: total
                }); 
            }

        } else {
            res.json({
                message: "user doesn't exist",
                method: "get",
                result: [],
                currentPage: 1,
                totalPages: 1
            }); 
        }
    } catch (err) {
        console.error(err.message);
    }
});

// Listen on Port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});