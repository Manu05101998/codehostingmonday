const axios = require('axios');
const express = require('express');

const app = express();
const PORT = 8080;

const MONDAY_API_URL = 'https://api.monday.com/v2';
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ5Nzc1OTMwNSwiYWFpIjoxMSwidWlkIjoyNjUxNTg3MiwiaWFkIjoiMjAyNS0wNC0wOVQxNDo0MTowNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6ODQ3MzgwMiwicmduIjoidXNlMSJ9.4YHlfa0zYG9hCez1omC6CSbDIbburhlnIwpSUXaw0FE';

const boardId = 8896263752;
const itemId = 8896263883;
const statusColumnId = 'status';
const dateColumnId = 'date4';

const checkStatusAndUpdateDate = async () => {
  try {
    const statusQuery = `
      query {
        items(ids: ${itemId}) {
          column_values(ids: ["${statusColumnId}"]) {
            id
            text
          }
        }
      }
    `;

    const response = await axios.post(MONDAY_API_URL, { query: statusQuery }, {
      headers: {
        Authorization: API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const status = response.data.data.items[0].column_values[0].text;

    if (status === 'Done') {
      const today = new Date().toISOString().split('T')[0];
      const mutation = `
        mutation {
          change_column_value(
            board_id: ${boardId},
            item_id: ${itemId},
            column_id: "${dateColumnId}",
            value: "{\\"date\\": \\"${today}\\"}"
          ) {
            id
          }
        }
      `;

      await axios.post(MONDAY_API_URL, { query: mutation }, {
        headers: {
          Authorization: API_KEY,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Date column updated successfully!');
      return '✅ Date column updated successfully!';
    } else {
      console.log(`ℹ️ Status is "${status}", not "Done".`);
      return `ℹ️ Status is "${status}", not "Done".`;
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return `❌ Error: ${error.response?.data || error.message}`;
  }
};

// Root path to check server
app.get('/', (req, res) => {
  res.send('✅ Server is running on port 8080');
});

// New /GetDate route to trigger status check and date update
app.get('/GetDate', async (req, res) => {
  const result = await checkStatusAndUpdateDate();
  res.send(result);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Listening at http://localhost:${PORT}`);
});
