const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

const app = express();

const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) {
  console.log("❌ 缺少 BOT_TOKEN");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, {
  polling: true
});

console.log("🤖 Telegram Bot Running");

app.get('/', (req, res) => {
  res.send('Bot Running');
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🌐 Web Server Running on ${PORT}`);
});

async function getMarket(symbol) {

  try {

    const pair = symbol.toUpperCase().replace("USDT","") + "USDT";

    const res = await axios.get(
      `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${pair}`
    );

    const data = res.data;

    const price = parseFloat(data.lastPrice);
    const change = parseFloat(data.priceChangePercent);

    let trend = "震荡";

    if (change > 3) {
      trend = "强势上涨 🚀";
    } else if (change > 0) {
      trend = "上涨 📈";
    } else if (change < -3) {
      trend = "强势下跌 📉";
    } else if (change < 0) {
      trend = "下跌 ⬇️";
    }

    return `
📊 ${pair}

💰 当前价格：${price}

📈 24h涨跌：${change.toFixed(2)}%

📌 趋势：${trend}
`;

  } catch (err) {

    return "❌ 币种不存在";
  }
}

bot.on('message', async (msg) => {

  const chatId = msg.chat.id;

  const text = msg.text;

  if (!text) return;

  if (text.startsWith('/')) return;

  await bot.sendMessage(chatId, "🔍 正在查询...");

  const result = await getMarket(text);

  await bot.sendMessage(chatId, result);
});