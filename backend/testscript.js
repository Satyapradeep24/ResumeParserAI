// import OpenAI from 'openai';
// import dotenv from 'dotenv';

// // Load environment variables from .env file
// dotenv.config();

// const client = new OpenAI({
//   baseURL:'https://beta.sree.shop/v1',
//   apiKey: 'ddc-PSbfdGtfxazP6IvChWMsstBLEiuCClWLhrJRRbjRieLDvWmr67'
// });

// async function testOpenAI() {
//   try {
//     const response = await client.chat.completions.create({
//       model: 'Provider-5/gpt-4o', 
//       messages: [
//         { role: 'user', content: 'What is the capital of France?' }
//       ]
//     });

//     console.log('Response from OpenAI:', response.choices[0].message.content);
//   } catch (error) {
//     console.error('Error fetching response:', error);
//   }
// }

// testOpenAI();
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const completion = openai.chat.completions.create({
  model: "gpt-4o-mini",
  store: true,
  messages: [
    {"role": "user", "content": "write a haiku about ai"},
  ],
});

completion.then((result) => console.log(result.choices[0].message));