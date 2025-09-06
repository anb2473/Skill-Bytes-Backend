import fetch from 'node-fetch'; // or global fetch in Node 18+

const url = 'http://localhost:3000/admin/send-challenge';

const body = {
  title: 'String Reversal',
  description: `
  Write a function which takes a string and returns the reverse of that string.
  
  Input: String (i.e., "hello")
  Output: Reversed String (i.e., "olleh")`,
  difficulty: 'beginner',
  tags: ['arrays', 'strings']
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
