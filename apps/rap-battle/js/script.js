var synth = (()=>{
  const s = window.speechSynthesis;
  !s && alert('speechSynthesis unavailable');
  if (!s) return null;
  // s.onvoiceschanged && (s.onvoiceschanged = populateVoiceLists);
  return s;
})();

var voices;
function loadVoices() {
  voices = synth.getVoices().sort(function (a, b) {
    const aname = a.name.toUpperCase(),
      bname = b.name.toUpperCase();
    if (aname < bname) return -1;
    else if (aname == bname) return 0;
    else return +1;
  });
} 


function handleChange(bot, prop) {
  bot.ui[prop].onchange = () => {
    bot[prop] = bot.ui[prop].value;
    //bot.ui.rateValue.textContent = rate.value;
  };  
}

function initVoiceSelect(bot) {
  const select = bot.ui.voice;
  bot.voiceIndex = select.selectedIndex;
  select.innerHTML = "";
  voices.forEach((v, i) => {
    const option = document.createElement("option");
    option.textContent = v.name + " (" + v.lang + ")" + (v.default ? " -- DEFAULT" : "");
    option.setAttribute("data-lang", v.lang);
    option.setAttribute("data-name", v.name);
    select.appendChild(option);
    if (bot.voiceIndex < 0 && v.default)  {
      bot.voiceIndex = i;
      bot.voice = v.name;
      bot.lang = v.lang;
    }
  });
  select.selectedIndex = bot.voiceIndex;
  select.onchange = function () {
    bot.voiceIndex = select.selectedIndex;
    bot.voice = select.selectedOptions[0].getAttribute("data-name");
    bot.lang = select.selectedOptions[0].getAttribute("data-lang");
    // bot.ui.info.innerText = `${bot.voice} ${bot.lang}`;
  };
}

function handlePlay(bot) {
  bot.ui.play.onclick = () => {
    speak(bot);
  }
}

function speak(bot, options) {
  // if (synth.speaking) {
  //   console.error("speechSynthesis.speaking");
  //   return;
  // }
  const text = bot.ui.text.value;
  if (!text) return;
  var utterance = new SpeechSynthesisUtterance(text);
  utterance.onend = (event) => console.log("spoke");
  utterance.onerror = (event) => console.error(event);
  utterance.voice = voices[bot.voiceIndex];
  utterance.pitch = bot.pitch || 1;
  utterance.rate = bot.rate || 1;
  synth.speak(utterance);
}

function createBot(index) {
  const bot = {
    index,
    ui: {
      info: document.querySelector(`#info${index}`),
      text: document.querySelector(`#text${index}`),
      voice: document.querySelector(`#voiceSelect${index}`),
      pitch: document.querySelector(`#pitch${index}`),
      rate: document.querySelector(`#rate${index}`),
      play: document.querySelector(`#play${index}`),
    },
    voiceIndex: -1,

  };
  
  initVoiceSelect(bot);
  handleChange(bot, 'rate');
  handleChange(bot, 'pitch');
  handlePlay(bot);

  return bot;
}


function createBots(count) {
  return Array.from(
    {length: count}, 
    (v, index) => createBot(index));
}

const BOT_COUNT = 1;

var bots = [];

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => {
    loadVoices();
    bots = createBots(BOT_COUNT);
  };
}
