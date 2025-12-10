import fetch from 'node-fetch';

const url = 'https://ylep0b-ip-96-241-22-239.tunnelmole.net/admin/send-challenge';

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
  functionName: 'reverseString',
  testCases: [
    { input: 'hello', expectedOutput: 'olleh' },
    { input: '12345', expectedOutput: '54321' },
    { input: 'code', expectedOutput: 'edoc' },
    { input: '', expectedOutput: '' },
  ],
  generator: {
    inFn: `
      const randomStr = (n) => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const length = 1 + Math.floor(Math.random() * n);
        return Array.from({ length }, () => 
          chars[Math.floor(Math.random() * chars.length)]
        ).join('');
      };

      const out = randomStr(1000);
      out;
    `,
    outFn: `
      const reverseString = s => {
        let ret = "";
        for (let i = s.length - 1; i >= 0; i--) {
          ret += s[i];
        }  
        return ret;
      };

      const out = reverseString(input) === output;
      out;
    `,
    cases: 100,
  },
  tags: ['algorithms', 'data-structures'],
  help: `
  In order to solve the problem try breaking down what it is actually asking. For any input, for example
  "hello", we need to return the reverse, or "olleh". All we are doing when we are reversing the string is
  creating reading the string from the last character to the first, and adding each character to a new string.
  As such the problem can be solved with a simple for loop.
  `
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
