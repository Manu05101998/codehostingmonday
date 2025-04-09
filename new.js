const axios = require('axios');

const MONDAY_API_URL = 'https://api.monday.com/v2';
const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ5Nzc1OTMwNSwiYWFpIjoxMSwidWlkIjoyNjUxNTg3MiwiaWFkIjoiMjAyNS0wNC0wOVQxNDo0MTowNy4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6ODQ3MzgwMiwicmduIjoidXNlMSJ9.4YHlfa0zYG9hCez1omC6CSbDIbburhlnIwpSUXaw0FE'; // Replace with your API key

const boardId = 8896263752;
const itemId = 8896263883;
const statusColumnId = 'status'; // Replace with your status column ID
const dateColumnId = 'date4';     // Replace with your date column ID



const checkStatusAndUpdateDate = async () => {
  try {
    // Step 1: Get status value
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

    // Step 2: If status is "Done", update date column
    if (status === 'Done') {
      const today = new Date().toISOString().split('T')[0]; // e.g., "2025-04-09"
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
    } else {
      console.log(`ℹ️ Status is "${status}", not "Done".`);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

checkStatusAndUpdateDate();
