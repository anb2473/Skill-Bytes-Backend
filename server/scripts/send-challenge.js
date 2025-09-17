import fetch from 'node-fetch'; // or global fetch in Node 18+

const url = 'http://localhost:3000/admin/send-challenge';

const body = {
  title: 'String Reversal',
  description: `
    <style>
      body {
        background-color: #000000;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 20px;
      }
      pre {
        background-color: #1a1a1a;
        padding: 12px;
        border-radius: 4px;
        overflow-x: auto;
        margin: 8px 0;
      }
      code {
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 14px;
      }
      h4 {
        margin: 16px 0 8px 0;
        font-weight: 600;
      }
      ul {
        margin: 8px 0;
        padding-left: 20px;
      }
      li {
        margin: 4px 0;
      }
    </style>
    
    Write a function which takes a string and returns all of the characters in that string in reverse order.

    <h4>Example 1:</h4>
    <pre><code>Input: str = "hello"
Output: "olleh"</code></pre>

    <h4>Example 2:</h4>
    <pre><code>Input: str = "12345"
Output: "54321"</code></pre>

    <h4>Example 3:</h4>
    <pre><code>Input: str = "code"
Output: "edoc"</code></pre>

    <h4>Constraints:</h4>
    <ul>
      <li>The input must be a string</li>
      <li>str.length <= 1000</li>
    </ul>
    `,
  difficulty: 'beginner',
  content: `
    // reverse_string
    // Input: String (i.e., "hello")
    // Output: Reversed String (i.e., "olleh")

    function reverseString(str) {
    
    }`,
  tags: ['algorithms', 'data-structures']
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
