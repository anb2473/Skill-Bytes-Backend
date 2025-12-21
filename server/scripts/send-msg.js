import fetch from 'node-fetch'; // or global fetch in Node 18+

const url = 'https://participating-fees-august-garcia.trycloudflare.com/api/admin/send-msg';

const body = {
  icon: '📢',
  content: 'Test message!',
  bannerColor: '#4CAF50'
};

// Encode Basic Auth (username empty, password = change_in_production)
const authHeader = 'Basic ' + Buffer.from(`:change_in_production`).toString('base64');

async function sendAdminMessage() {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

sendAdminMessage();
