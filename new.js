import express from 'express';
import axios from 'axios';
import { Logger } from '@mondaycom/apps-sdk';

const app = express();
const PORT = 8080;

const MONDAY_API_URL = 'https://api.monday.com/v2';
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ5Nzc1OTMwNSwiYWFpIjoxMSwidWlkIjoyNjUxNTg3MiwiaWFkIjoiMjAyNS0wNC0wOVQxNDo0MTowNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6ODQ3MzgwMiwicmduIjoidXNlMSJ9.4YHlfa0zYG9hCez1omC6CSbDIbburhlnIwpSUXaw0FE'; // Truncated for safety

const boardId = 8896263752;
const itemId = 8896263883;
const statusColumnId = 'status';
const dateColumnId = 'date4';

// 🔸 Initialize logger
const logger = new Logger('app-check-status');

// 🔄 Function to check status and update date
const checkStatusAndUpdateDate = async () => {
  try {
    logger.info('Starting checkStatusAndUpdateDate...');

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
    logger.info(`Fetched status: ${status}`);

    if (status === 'Done') {
      const today = new Date().toISOString().split('T')[0];
      logger.info(`Status is 'Done'. Updating date to: ${today}`);

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

      logger.info('✅ Date column updated successfully!');
      return '✅ Date column updated successfully!';
    } else {
      logger.warn(`Status is not 'Done' — it's "${status}".`);
      return `ℹ️ Status is "${status}", not "Done".`;
    }

  } catch (error) {
    logger.error('❌ Error while processing:', { error });
    return `❌ Error: ${error.response?.data || error.message}`;
  }
};

// ✅ Root path to check if server is running
app.get('/', (req, res) => {
  logger.info('GET request at root "/"');
  res.send('✅ Server is running on port 8080');
});

// ✅ New route to trigger logic
app.get('/GetDate', async (req, res) => {
  logger.info('GET request at /GetDate');
  const result = await checkStatusAndUpdateDate();
  res.send(result);
});

// 🔥 Start the server
app.listen(PORT, () => {
  logger.info(`🚀 Listening at http://localhost:${PORT}`);
});
