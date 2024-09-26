import pool from "../db/db.js";

//get all books from the database, ordered by the most recent read date
export const getAllBooks = async () => {
  const result = await pool.query('SELECT * FROM books ORDER BY read_date DESC');
  return result.rows;
};

//get a single book by its ID
export const getBookById = async (id) => {
  const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
  return result.rows[0];
};

//add a new book to the database
export const addBook = async (book) => {
  const { title, author, cover_url, review, rating, read_date } = book;
  await pool.query(
    'INSERT INTO books (title, author, cover_url, review, rating, read_date) VALUES ($1, $2, $3, $4, $5, $6)',
    [title, author, cover_url, review, rating, read_date]
  );
};

//update an existing book's details in the database
export const updateBook = async (id, book) => {
  const { title, author, cover_url, review, rating, read_date } = book;
  await pool.query(
    'UPDATE books SET title = $1, author = $2, cover_url = $3, review = $4, rating = $5, read_date = $6 WHERE id = $7',
    [title, author, cover_url, review, rating, read_date, id]
  );
};

//delete a book from the database by its ID
export const deleteBook = async (id) => {
  await pool.query('DELETE FROM books WHERE id = $1', [id]);
};