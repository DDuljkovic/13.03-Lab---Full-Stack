var express = require('express'); 
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next){
  try {
    req.db.query('SELECT * FROM todos;', (err, results) => {
      if (err) {
        console.error('Error fetching todos:', err);
        return res.status(500).send('Error fetching todos');
      }
      res.render('index', { title: 'My Simple TODO', todos: results, error: null });
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Error fetching items');
  }
});

/* CREATE a new task */
router.post('/create', function (req, res, next) {
  let { task } = req.body;
  task = task ? task.trim() : "";

  // Prevent blank tasks
  if (!task) {
    req.db.query('SELECT * FROM todos;', (err, results) => {
      return res.render('index', { 
        title: 'My Simple TODO', 
        todos: results, 
        error: 'Task description cannot be blank.' 
      });
    });
    return;
  }

  try {
    req.db.query('INSERT INTO todos (task, completed) VALUES (?, 0);', [task], (err, results) => {
      if (err) {
        console.error('Error adding todo:', err);
        return res.status(500).send('Error adding todo');
      }
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error adding todo:', error);
    res.status(500).send('Error adding todo');
  }
});

/* DELETE a task */
router.post('/delete', function (req, res, next) {
  const { id } = req.body;
  try {
    req.db.query('DELETE FROM todos WHERE id = ?;', [id], (err, results) => {
      if (err) {
        console.error('Error deleting todo:', err);
        return res.status(500).send('Error deleting todo');
      }
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).send('Error deleting todo');
  }
});

/* LOAD edit page for a task */
router.get('/edit/:id', function (req, res, next) {
  const { id } = req.params;

  req.db.query('SELECT * FROM todos WHERE id = ?;', [id], (err, results) => {
    if (err) {
      console.error('Error fetching task:', err);
      return res.status(500).send('Error fetching task');
    }
    if (results.length === 0) {
      return res.status(404).send('Task not found');
    }
    res.render('edit', { task: results[0], error: null });
  });
});

/* SAVE edits to a task */
router.post('/edit/:id', function (req, res, next) {
  const { id } = req.params;
  let { task, completed } = req.body;

  task = task ? task.trim() : "";
  completed = completed === 'on' ? 1 : 0;

  // Prevent blank edits
  if (!task) {
    req.db.query('SELECT * FROM todos WHERE id = ?;', [id], (err, results) => {
      return res.render('edit', { 
        task: results[0], 
        error: 'Task description cannot be blank.' 
      });
    });
    return;
  }

  req.db.query(
    'UPDATE todos SET task = ?, completed = ? WHERE id = ?;',
    [task, completed, id],
    (err, results) => {
      if (err) {
        console.error('Error updating todo:', err);
        return res.status(500).send('Error updating todo');
      }
      res.redirect('/');
    }
  );
});

/* MARK as completed */
router.post('/complete', function (req, res, next) {
  const { id } = req.body;

  req.db.query(
    'UPDATE todos SET completed = 1 WHERE id = ?;',
    [id],
    (err, results) => {
      if (err) {
        console.error('Error marking completed:', err);
        return res.status(500).send('Error marking task completed');
      }
      res.redirect('/');
    }
  );
});

module.exports = router;
