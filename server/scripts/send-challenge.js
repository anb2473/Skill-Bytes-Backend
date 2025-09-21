import fetch from 'node-fetch'; // or global fetch in Node 18+

const url = 'http://localhost:3000/admin/send-challenge';

const body = {
  title: 'String Reversal',
  description: `
    <style>
      pre { background: #1a1a1a; padding: 10px; margin: 5px 0; }
      .example { margin-bottom: 15px; }
      .constraints { margin-top: 20px; }
    </style>
    
    Write a function which takes a string and returns all of the characters in that string in reverse order.

    <div style="align-items: left; text-align: left;">
    
    <div class="example" style="margin-top: 15px;">
    Example 1:
    <pre>Input: str = "hello"
Output: "olleh"</pre>
    </div>

    <div class="example">
    Example 2:
    <pre>Input: str = "12345"
Output: "54321"</pre>
    </div>

    <div class="example">
    Example 3:
    <pre>Input: str = "code"
Output: "edoc"</pre>
    </div>

    <div class="constraints">
    Constraints:
    <ul style="margin-left: 25px;">
      <li>The input must be a string</li>
      <li>str.length <= 1000</li>
    </ul>
    </div>

    </div>
    `,
  selectorDescription: 'Write a function that takes a string and returns it reversed',
  difficulty: 'beginner',
  points: 10,
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
