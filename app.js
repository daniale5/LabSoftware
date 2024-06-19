const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql2024',
    database: 'crud_nodejs'
  });

  db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL!');
  });

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

  app.post('/cadastro', (req, res) => {
    const {usuario, email, telefone} = req.body;
    const sql = 'INSERT INTO cadastro (usuario, email, telefone) VALUES (?, ?, ?)';
    db.query(sql, [usuario, email, telefone], (err, result) => {
      if (err) throw err;
      res.send('Cadastro realizado com sucesso!');
    });
  });

  app.get('/lista', (req, res) => {
    const sql = 'SELECT * FROM cadastro';
    db.query(sql, (err, results) => {
      if (err) throw err;
  
      let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title> Lista de Pessoas </title>
        </head>
        <body>
          <h1> Lista de Pessoas </h1>
          <table border="1">
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th> Alterar </th>
              <th> Excluir </th>

            </tr>`;
  
      results.forEach(person => {
        html += `
          <tr>
            <td>${person.id}</td>
            <td>${person.usuario}</td>
            <td>${person.email}</td>
            <td>${person.telefone}</td>
            <td>
            <a href="/editar/${person.id}"> Alterar </a>
            </td>
            <td>
            <form action="/excluir/${person.id}" method="POST" style="display: inline;">
              <button type="submit">Excluir</button>
            </form>
            </td>
          </tr>`;
      });
  
      html += `
          </table>
        </body>
        </html>`;
  
      res.send(html);
    });
  });

  app.post('/excluir/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'DELETE FROM cadastro WHERE id = ?';
    db.query(sql, [userId], (err, result) => {
      if (err) throw err;
      res.redirect('/lista');
    });
  });

  app.post('/atualizar/:id', (req, res) => {
    const userId = req.params.id;
    const { usuario, email, telefone } = req.body;
    const sql = 'UPDATE cadastro SET usuario=?, email=?, telefone=? WHERE id=?';
    db.query(sql, [usuario, email, telefone, userId], (err, result) => {
      if (err) throw err;
      res.redirect('/lista');
    });
  });

  app.get('/editar/:id', (req, res) => {
    const userId = req.params.id;
    const sql = 'SELECT * FROM cadastro WHERE id = ?';
    db.query(sql, [userId], (err, result) => {
      if (err) throw err;
  
      if (result.length > 0) {
        const pessoa = result[0];
        let html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title> Editar Pessoa </title>
          </head>
          <body>
            <h1> Editar Pessoa </h1>
            <form action="/atualizar/${userId}" method="POST">
              <label for="nome">Nome: </label>
              <input type="text" id="usuario" name="usuario" value="${pessoa.usuario}" required><br><br>
              <label for="email">Email: </label>
              <input type="email" id="email" name="email" value="${pessoa.email}" required><br><br>
              <label for="telefone">Telefone: </label>
              <input type="text" id="telefone" name="telefone" value="${pessoa.telefone}" required><br><br>
              <input type="submit" value="Salvar Alterações">
            </form>
          </body>
          </html>`;
        
        res.send(html);
      } else {
        res.send('Pessoa não encontrada');
      }
    });
  });

  app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
  });