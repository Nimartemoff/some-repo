var express = require('express');
var router = express.Router();

const pgp = require('pg-promise')();
const db = pgp(`postgres://postgres:${process.env.DB_PASSWORD}@db:5432/vacancies`);

const VACANCIES_PER_PAGE = 30;

router.get('/', function(req, res, next) {
  let page = parseInt(req.query.p);
  if (!page) {
    page = 1;
  }

  let count = parseInt(req.query.count);
  if (!count) {
    count = VACANCIES_PER_PAGE;
  }

  let sortKeySQLParam = "vacancy.automation_percent";
  let sortKey = req.query.sort;
  if (!sortKey || sortKey === 'date') {
    sortKeySQLParam = "vacancy.date";
  } else if (sortKey === 'autopercent') {
    sortKeySQLParam = "vacancy.automation_percent";
  }

  let sortAscSQLParam = "DESC";
  let sortAsc = req.query.asc;
  if (sortAsc === "true") {
    sortAscSQLParam = "";
  }

  db.one('SELECT COUNT(vacancy.id) FROM vacancy').then(vacanciesCount => {
    let pageCount = Math.ceil(vacanciesCount['count'] / count);
    if (page > pageCount) {
      res.sendStatus(404);
      return;
    }
    db.any(`SELECT company.img_href, vacancy.title, company.name, vacancy.automation_percent, vacancy.date, vacancy.id 
          FROM vacancy LEFT OUTER JOIN company 
          ON vacancy.company_id = company.id 
          ORDER BY ${sortKeySQLParam} ${sortAscSQLParam} 
          LIMIT ${count} 
          OFFSET ${(Number(page)-1) * count}`)
         .then(data => res.json({
          "page": page,
          "pageCount": pageCount,
          "data": data
         }))
         .catch(err => next(err));
  }).catch(err => next(err));
});

router.get('/:id', function(req, res, next) {
  let id = parseInt(req.params.id);
  db.any(`SELECT vacancy.title AS vacancy_title, company.name AS company_name, vacancy.link AS vacancy_link, 
          ARRAY(SELECT name FROM function WHERE function.vacancy_id='${id}' AND function.is_automatable) AS functions, 
            vacancy.date, automation_percent 
          FROM vacancy LEFT OUTER JOIN company 
          ON vacancy.company_id = company.id 
          WHERE vacancy.id = '${id}'`)
         .then(data => res.send(data))
         .catch(err => next(err));
});

module.exports = router;
