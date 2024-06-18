const express = require("express");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 8080;

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "src", "video.html"));
});

app.get("/video/list", async function (req, res) {
res.sendFile(path.join(__dirname, "src", "video.json"));
});

app.post("/api/request/f", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "src", "video.json");
    const dataa =  JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const data = dataa.data;
    const random = data[Math.floor(Math.random() * data.length)];

    const response = await axios.get(
      `https://www.tikwm.com/api/?url=${random}`,
    );
    const video = response.data.data.play;
    const username = response.data.data.author.unique_id || "Anonymous";
    const nickname = response.data.data.author.nickname || "Anonymous";
    const userid = response.data.data.author.id;
    const title = response.data.data.title || "No title";
    const totalvids = data.length;



    res.json({
      code: "200",
      msg: "success",
      data: { eurixmp4: video, username: `@${username}`, nickname: nickname, userid: userid, title: title, totalvids: totalvids  }
    });
  } catch (err) {
    res.json({
      error: "error fetching shoti api",
      status: 404,
      result: "error",
    });
  }
});
  
app.get("/api/add/", async function (req, res) {
try {
return  res.sendFile(path.join(__dirname, "src", "addpanel.html"));
} catch (error) {
res.json({error: error.message })
console.log(error.message);
}
});

app.get("/shoti", async function (req, res) {
  try {
  const { user } = req.query;
  if(!user) {
  return res.json({error: "Please search your want to add api"})
  }
    const response = await axios.get(`https://eurix-api.replit.app/tiksearch?search=${user}`);
    const videoData = response.data.data.videos[0];
    const video = videoData.play;
    const id = videoData.video_id;
    const username = videoData.author.unique_id;
    const nickname = videoData.author.nickname;
    const title = videoData.title;

    await axios.get(`https://shoti-api.replit.app/api/add/shoti?link=${id}`);

    res.json({ url: video, id, username, nickname, title });
  } catch (e) {
    res.json({ error: e.message });
  }
});

app.get("/api/add/shoti", async (req, res) => {
  const { link } = req.query;

  if (
    !link ||
    (!link.startsWith("https://vt.tiktok.com/") &&
      !link.startsWith("https://www.tiktok.com/") &&
      !link.startsWith("7"))
  ) {
    return res.status(400).json({ error: "Invalid link", status: 400, result: "error" });
  }

  const filePath = path.join(__dirname, "src", "video.json");
  let dataa;

  try {
    dataa = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    dataa = { data: [] };
  }

  const data = dataa.data;

  if (!data.includes(link)) {
    data.push(link);
    fs.writeFileSync(filePath, JSON.stringify({ data }, null, 4));
    return res.json({ code: 200, msg: "success", data });
  } else {
    return res.status(400).json({ error: "Link already exists", status: 400, result: "error" });
  }
});



app.listen(port, () => {
  console.log("Listening on port " + port);
});
