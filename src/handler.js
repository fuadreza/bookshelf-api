const { nanoid } = require('nanoid');
const books = require('./books');
const RequestError = require('../exceptions/request_error');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;

  try {
    if (!name) {
      throw new RequestError('Mohon isi nama buku');
    }
    if (readPage > pageCount) {
      throw new RequestError('readPage tidak boleh lebih besar dari pageCount');
    }

    const newBook = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      insertedAt,
      updatedAt,
    };

    books.push(newBook);

    const isSuccess = books.filter((book) => book.id === id).length > 0;

    if (isSuccess) {
      const response = h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      });

      response.code(201);
      return response;
    }

    throw new RequestError();
  } catch (error) {
    let message = 'Gagal menambahkan buku.';

    if (error instanceof RequestError) {
      message += ` ${error.message}`;
    }

    const response = h.response({
      status: 'fail',
      message,
    });

    response.code(400);
    return response;
  }
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  let filtered = [...books];

  if (name) {
    filtered = books.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
  }
  if (reading) {
    if (reading === '0') {
      filtered = filtered.filter((book) => !book.reading);
    } else if (reading === '1') {
      filtered = filtered.filter((book) => book.reading);
    }
  }
  if (finished) {
    if (finished === '0') {
      filtered = filtered.filter((book) => !book.finished);
    } else if (finished === '1') {
      filtered = filtered.filter((book) => book.finished);
    }
  }

  const newBooks = filtered.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));

  const response = h.response({
    status: 'success',
    data: {
      books: newBooks,
    },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  try {
    const book = books.filter((item) => item.id === bookId)[0];

    if (!book) {
      throw new RequestError();
    }

    return {
      status: 'success',
      data: {
        book,
      },
    };
  } catch (error) {
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
  }
};

const editBookById = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  let responseCode = 400;
  try {
    const index = books.findIndex((book) => book.id === bookId);

    if (index !== -1) {
      if (!name) {
        responseCode = 400;
        throw new RequestError('Mohon isi nama buku');
      }
      if (readPage > pageCount) {
        responseCode = 400;
        throw new RequestError('readPage tidak boleh lebih besar dari pageCount');
      }

      const updatedAt = new Date().toISOString();
      const finished = pageCount === readPage;
      books[index] = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        updatedAt,
      };

      const response = h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      });
      responseCode = 200;
      response.code(responseCode);
      return response;
    }
    responseCode = 404;
    throw new RequestError('Id tidak ditemukan');
  } catch (error) {
    let message = 'Gagal memperbarui buku.';

    if (error instanceof RequestError) {
      message += ` ${error.message}`;
    }

    const response = h.response({
      status: 'fail',
      message,
    });

    response.code(responseCode);
    return response;
  }
};

const deleteBookById = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);
  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookById,
  deleteBookById,
};
