const Database = require('better-sqlite3');
const db = new Database('data/polymarket.db');

// Force checkpoint
db.pragma('wal_checkpoint(TRUNCATE)');

// Check total questions
const total = db.prepare('SELECT COUNT(*) as c FROM question_initialized_events').get().c;
console.log('Total questions:', total);

// Check with decoded data
const withDecoded = db.prepare(`
  SELECT COUNT(*) as c 
  FROM question_initialized_events 
  WHERE ancillary_data_decoded IS NOT NULL 
    AND ancillary_data_decoded != '' 
    AND ancillary_data_decoded != 'null'
`).get().c;
console.log('With decoded data:', withDecoded);

// Check markets query
const markets = db.prepare(`
  SELECT DISTINCT
    q.question_id,
    LENGTH(q.ancillary_data_decoded) as decoded_len,
    c.condition_id
  FROM question_initialized_events q
  INNER JOIN condition_preparation_events c ON q.question_id = c.question_id
  WHERE q.ancillary_data_decoded IS NOT NULL
    AND q.ancillary_data_decoded != ''
    AND q.ancillary_data_decoded != 'null'
  LIMIT 5
`).all();

console.log('Markets query result count:', markets.length);
if (markets.length > 0) {
  console.log('First market:', JSON.stringify(markets[0], null, 2));
}

db.close();

