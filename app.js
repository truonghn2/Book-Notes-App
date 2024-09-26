import express from 'express';
import bodyParser from 'body-parser';
import pg from "pg"
import axios from 'axios';

const app = express();
const port = 3000;

const db = new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"books",
  password:"Hgaidep62!",
  port:5432,
});

db.connect();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


const router = express.Router();
const API_BASE_URL = 'https://covers.openlibrary.org/b/id/';

//route to display all books
app.get('/', async (req, res) => {
  try {
    const books = await getAllBooks();
    console.log('Books to render:', books); 
    res.render('index.ejs', { books });
  } catch (err) {
    console.log(err);
  }
});


//route to display the form to add a new book
app.get('/add', (req, res) => {
  console.log('Accessing /add route');
  try {
    res.render('addBook.ejs');
  } catch (err) {
    console.log(err);
  }
});

//handle form submission to add a new book
app.post('/add', async (req, res) => {
  const { title, author, rating, review, read_date } = req.body;

  //get the cover URL using the Open Library API
  const response = await axios.get(`https://openlibrary.org/search.json?title=${title}&author=${author}`);
  const cover_id = response.data.docs[0]?.cover_i;
  const cover_url = cover_id ? `${API_BASE_URL}${cover_id}-L.jpg` : '';

  const newBook = { title, author, cover_url, rating, review, read_date };
  await addBook(newBook);
  res.redirect('/');
});

//route to display the form to edit an existing book
app.get('/edit/:id', async (req, res) => {
  const book = await getBookById(req.params.id);
  res.render('editBook.ejs', { book });
});

//handle form submission to update an existing book
app.post('/edit/:id', async (req, res) => {
  const { title, author, rating, review, read_date } = req.body;

  //get the updated cover URL using the Open Library API
  const response = await axios.get(`https://openlibrary.org/search.json?title=${title}&author=${author}`);
  const cover_id = response.data.docs[0]?.cover_i;
  const cover_url = cover_id ? `${API_BASE_URL}${cover_id}-L.jpg` : '';

  const updatedBook = { title, author, cover_url, rating, review, read_date };
  await updateBook(req.params.id, updatedBook);
  res.redirect('/');
});

//handle form submission to delete a book
app.post('/delete/:id', async (req, res) => {
  await deleteBook(req.params.id);
  res.redirect('/');
});


//get all books from the database, ordered by the most recent read date
const getAllBooks = async () => {
  const result = await db.query('SELECT * FROM books ORDER BY read_date DESC');
  return result.rows;
};

//get a single book by its ID
const getBookById = async (id) => {
  const result = await db.query('SELECT * FROM books WHERE id = $1', [id]);
  return result.rows[0];
};

//add a new book to the database
const addBook = async (book) => {
  const { title, author, cover_url, review, rating, read_date } = book;
  await db.query(
    'INSERT INTO books (title, author, cover_url, review, rating, read_date) VALUES ($1, $2, $3, $4, $5, $6)',
    [title, author, cover_url, review, rating, read_date]
  );
};

//update an existing book's details in the database
const updateBook = async (id, book) => {
  const { title, author, cover_url, review, rating, read_date } = book;
  await db.query(
    'UPDATE books SET title = $1, author = $2, cover_url = $3, review = $4, rating = $5, read_date = $6 WHERE id = $7',
    [title, author, cover_url, review, rating, read_date, id]
  );
};

//delete a book from the database by its ID
const deleteBook = async (id) => {
  await db.query('DELETE FROM books WHERE id = $1', [id]);
};

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});