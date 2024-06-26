import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import expressLayouts from "express-ejs-layouts";
import pg from "pg";

const app = new express();
const port = 3000;

const APIURL = 'http://localhost:3100';
let currentUserId = 1;
let nameList = [];
let message;

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public/"));
app.use(express.static("public/css"));
app.use(express.static("public/js"));
app.use(expressLayouts);
app.set('layout', './layout/full-width.ejs');

// Functions
async function getName() {
  const get = await axios.get(`${APIURL}/get/name`);
  nameList = get.data.result;
  return nameList;
}

// Get all Name
app.get('/', async (req, res) => {
  await getName();
  try {
    const find = nameList.find(name => name.id == currentUserId);
    const page = parseInt(req.query.page) || 1;
    const getTodo = await axios.get(`${APIURL}/test/get/todo/${currentUserId}?page=${page}`);
    const todo = getTodo.data;
    if(nameList.length > 0) {
      res.render('main.ejs', {
        names: nameList,
        current: find,
        todos: todo,
        currentPage: todo.currentPage,
        totalPages: todo.totalPages
      });
    } else {
      res.render('main.ejs', {
        names: nameList,
        message: "Please Create a list"
      })
    }
  } catch (err) {
    console.error(err.message);
  }
  
});

// Change currentUserID;
app.post('/name', async (req, res) => {
  try {
    currentUserId = req.body.userID;
    res.redirect('/');
  } catch (err) {
    console.error(err.message);
  }
});

// Create name
app.post('/add/name', async (req, res) => {
  if(req.body.name !== '') {
    console.log(req.body.name);
    await axios.post(`${APIURL}/create/name`, [req.body]);
    res.redirect('/');
  } else {
    await getName();
    const find = nameList.find(name => name.id == currentUserId);
    const page = parseInt(req.query.page) || 1;
    const getTodo = await axios.get(`${APIURL}/test/get/todo/${currentUserId}?page=${page}`);
    const todo = getTodo.data;
    res.render('main.ejs', {
      names: nameList,
      current: find,
      todos: todo,
      messageCreate: "Can't add an empty string",
      currentPage: todo.currentPage,
      totalPages: todo.totalPages
    });
  }
  
});

// (Get) Edit name by id
app.get('/edit/:id', async (req, res) => {
  await getName();
  const id = req.params.id;
  try {
    const find = nameList.find(name => name.id == id);
    if(find) {
      // console.log('Found editable ID');
      // console.log(find);
      res.render('pages/editname.ejs',{
        names: nameList,
        current: find,
        selected: find
      });
    } else {
      console.log('ID was not found');
      res.redirect('/');
    }
  } catch (err) {
    console.error(err.message);
    res.redirect('/')
  }
});

// (Put) Edit name by id
app.post('/update/name/:id', async (req, res) => {
  await getName();
  const id = req.params.id;
  const {name} = req.body;
  try {
    const find = nameList.find(name => name.id == id);
    if(find) {
      
      if(name !== '') {
        const update = await axios.put(`${APIURL}/edit/name/${id}`, req.body);
        console.log(update.data);
        console.log(`${find.name}(${find.id}) was successfully updated to ${name}(${id})`);
        res.redirect('/');
      } else {
        console.log('No name was updated');
        const find = nameList.find(name => name.id == id);
        res.render('pages/editname.ejs',{
          names: nameList,
          current: find,
          selected: find,
          namemess: "You can't put an empty string"
        });
      }
      
    } else {
      console.log('hereeee')
      console.log('No name was updated');
      
    }
  } catch (err) {
    console.error(err.message);
    res.redirect('/');
  }
});

// Delete name by id
app.get('/delete/:id', async (req, res) => {
  await getName();
  const id = req.params.id;
  try {
    const find = nameList.find(name => name.id == id);
    if(find) {
      console.log(`Delete: ${find.name}(${find.id}) was successfully deleted`);
      await axios.delete(`${APIURL}/delete/name/${find.id}`);
      res.redirect('/');
    } else {
      // console.log('Data was not found, none gets deleted');
      res.redirect('/');
    }
  } catch (err) {
    console.error(err.message);
    res.redirect('/')
  }
});






//                            To do Route                                  //
app.post('/delete/todo/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const delTodo = await axios.delete(`${APIURL}/delete/todo/${id}`);
    res.redirect('/');
  } catch (err) {
    console.error(err.message);
  }
});

// Get todo page
app.get('/delete/todo/:id', async (req, res) => {
  res.redirect('/');
});

// Get edit todo page
app.get('/edit/todo/:id', async (req, res) => {
  await getName();
  const id = req.params.id;
  try {
    const page = parseInt(req.query.page) || 1;
    const getTodo = await axios.get(`${APIURL}/test/get/todo/${currentUserId}?page=${page}`);
    const todo = getTodo.data.result;
    const find = todo.find(tod => tod.ts_id == id);
    if(find) {
      res.render('pages/edittodo.ejs', {
        names: nameList,
        current: find,
        todos: todo,
        selTSID: find.ts_id,
        selDESC: find.description,
        currentPage: todo.currentPage,
        totalPages: todo.totalPages
      });
    } else {
      res.redirect('/');
    }
  } catch (err) {
    console.error(err.message);
    res.redirect('/');
  }
});

// Edit to do by ts_id
app.post('/update/todo/:id', async (req, res) => {
  await getName();
  const id = req.params.id;
  const {newDescription} = req.body;
  try {
    if(newDescription !== '') {
      const editTodo = await axios.put(`${APIURL}/edit/todo/${id}`, [req.body]);
      res.redirect('/');
    } else {
      const page = parseInt(req.query.page) || 1;
      const getTodo = await axios.get(`${APIURL}/test/get/todo/${currentUserId}?page=${page}`);
      const todo = getTodo.data.result;
      const find = todo.find(tod => tod.ts_id == id);
      res.render('pages/edittodo.ejs', {
        names: nameList,
        current: find,
        todos: todo,
        selTSID: find.ts_id,
        selDESC: find.description,
        editMess: "You can't put an empty string",
        currentPage: todo.currentPage,
        totalPages: todo.totalPages
      });
    }
  } catch (err) {
    console.error(err.message);
  }
});

// Create to do
app.post('/create/todo', async (req, res) => {
  await getName();
  try {
    const id = req.body.todoID;
    const newTod = req.body.newTODO;

    if(newTod !== '') {
      const insert = await axios.post(`${APIURL}/create/todo`, [req.body]);
      res.redirect('/');
    } else {
      const page = parseInt(req.query.page) || 1;
      const getTodo = await axios.get(`${APIURL}/test/get/todo/${currentUserId}?page=${page}`);
      const todo = getTodo.data;
      const find = nameList.find(name => name.id == currentUserId);
      res.render('main.ejs', {
        names: nameList,
        current: find,
        todos: todo,
        todmessage: "You can't put an empty string",
        currentPage: todo.currentPage,
        totalPages: todo.totalPages
      });
    }
  } catch (err) {
    console.error(err.message);
  }
});

app.get('*', (req, res) => {
  res.status(404).send('404');
});

app.listen(port, () => {
  console.log(`Listening on Port ${port}`);
});