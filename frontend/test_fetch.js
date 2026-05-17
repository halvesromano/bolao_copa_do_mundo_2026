const axios = require('axios');

async function testFetch() {
  try {
    const res = await axios.get("http://localhost:8000/api/jogos/");
    const data = res.data;
    console.log("Is array?", Array.isArray(data));
    console.log("Length:", data.length);
    if (data.length > 0) {
      console.log("First item keys:", Object.keys(data[0]));
      console.log("First item fase:", data[0].fase);
      console.log("First item time_casa:", data[0].time_casa.nome);
    } else {
      console.log("Data:", data);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testFetch();
