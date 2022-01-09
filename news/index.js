const options = document.querySelectorAll("label");
for (let i = 0; i < options.length; i++) {
  options[i].addEventListener("click", ()=>{
    for (let j = 0; j < options.length; j++) {
      if(options[j].classList.contains("selected")){
        options[j].classList.remove("selected");
      }
    }
    options[i].classList.add("selected");
    for (let k = 0; k < options.length; k++) {
      options[k].classList.add("selectall");
    }
    let forVal = options[i].getAttribute("for");
    let selectInput = document.querySelector("#"+forVal);
    let getAtt = selectInput.getAttribute("type");
    if(getAtt == "checkbox"){
      selectInput.setAttribute("type", "radio");
    }else if(selectInput.checked == true){
      options[i].classList.remove("selected");
      selectInput.setAttribute("type", "checkbox");
    }
    let array = [];
    for (let l = 0; l < options.length; l++) {
      if(options[l].classList.contains("selected")){
        array.push(l);
      }
    }
    if(array.length == 0){
      for (let m = 0; m < options.length; m++) {
        options[m].removeAttribute("class");
      }
    }
  });
}

async function getData() {
  var response = await fetch("https://financialmodelingprep.com/api/v3/stock/gainers?apikey=bae022346716d971431b75f71e332fb5")
  var realData = await response.json()
  var mostGainerStocksArray = realData.mostGainerStock;
  const half = Math.ceil(mostGainerStocksArray.length / 1.2);
  const secondHalf = mostGainerStocksArray.splice(-half)
  mostGainerStocksArray.forEach((elem) => {
    console.log(`${elem.ticker}, ${elem.changesPercentage}%`)
    var txt = document.createElement('p')
    txt.innerText = `${elem.ticker}, ${elem.changesPercentage}%`
    document.getElementById('gainers').appendChild(txt)
    document.getElementById('gainers').style.color = "green";
  })
  return realData
} 

getData() 

async function losers() {
  var response = await fetch("https://financialmodelingprep.com/api/v3/stock/losers?apikey=bae022346716d971431b75f71e332fb5")
  var realData = await response.json()
  var mostLoserStocksArray = realData.mostLoserStock;
  const half = Math.ceil(mostLoserStocksArray.length / 1.2);
  const secondHalf = mostLoserStocksArray.splice(-half)
  mostLoserStocksArray.forEach((elem) => {
    console.log(`${elem.ticker}, ${elem.changesPercentage}%`)
    var txt = document.createElement('p')
    txt.innerText = `${elem.ticker}, ${elem.changesPercentage}%`
    document.getElementById('losers').appendChild(txt)
    document.getElementById('losers').style.color = "red";
  })
  return realData

}

losers() 

 document.getElementById("gainers").style.marginLeft = "140px"; 
 document.getElementById("losers").style.marginLeft = "140px"; 


 var counter = {
  // (A) HELPER - CREATE HR/MIN/SEC CELL
  //  txt : text for the cell (all small letters)
  square : (txt) => {
    let cell = document.createElement("div");
    cell.className = `cell ${txt}`;
    cell.innerHTML = `<div class="digits">0</div><div class="text">${txt}</div>`;
    return cell;
  },

  // (B) INITIALIZE COUNTDOWN TIMER
  //  target : target html container
  //  remain : seconds to countdown
  //  after : function, do this when countdown end (optional)
  attach : (instance) => {
    // (B1) GENERATE HTML
    instance.target.className = "countdown";
    if (instance.remain >= 86400) {
      instance.target.appendChild(counter.square("days"));
      instance.days = instance.target.querySelector(".days .digits");
    }
    if (instance.remain >= 3600) {
      instance.target.appendChild(counter.square("hours"));
      instance.hours = instance.target.querySelector(".hours .digits");
    }
    if (instance.remain >= 60) {
      instance.target.appendChild(counter.square("mins"));
      instance.mins = instance.target.querySelector(".mins .digits");
    }
    instance.target.appendChild(counter.square("secs"));
    instance.secs = instance.target.querySelector(".secs .digits");

    // (B2) TIMER
    instance.timer = setInterval(() => { counter.ticker(instance); }, 1000);
  },

  // (C) COUNTDOWN TICKER
  ticker : (instance) => {
    // (C1) TIMER STOP
    instance.remain--;
    if (instance.remain<=0) {
      clearInterval(instance.timer);
      instance.remain = 0;
      if (typeof instance.after == "function") { instance.after(); }
    }

    // (C2) CALCULATE REMAINING DAYS/HOURS/MINS/SECS
    // 1 day = 60 secs * 60 mins * 24 hrs = 86400 secs
    // 1 hr = 60 secs * 60 mins = 3600 secs
    // 1 min = 60 secs
    let secs = instance.remain;
    let days = Math.floor(secs / 86400);
    secs -= days * 86400;
    let hours = Math.floor(secs / 3600);
    secs -= hours * 3600;
    let mins  = Math.floor(secs / 60);
    secs -= mins * 60;

    // (C3) UPDATE HTML
    instance.secs.innerHTML = secs;
    if (instance.mins !== undefined) { instance.mins.innerHTML = mins; }
    if (instance.hours !== undefined) { instance.hours.innerHTML = hours; }
    if (instance.days !== undefined) { instance.days.innerHTML = days; }
  },

  // (D) HELPER - CONVERT DATE/TIME TO REMAINING SECONDS
  //  till : (date object) countdown to this date/time
  toSecs : (till) => {
    till = Math.floor(till / 1000);
    let remain = till - Math.floor(Date.now() / 1000);
    return remain<0 ? 0 : remain;
  }
};

// (E) ATTACH COUNTDOWN TIMER
window.onload = () => {
  counter.attach({
    // TARGET + REMAINING TIME
    target : document.getElementById("demo"),
    remain : 86500,
    
    // COUNTDOWN TO SPECIFIC DATE
    // remain : counter.toSecs(new Date("YYYY-MM-DD")),
    
    // OPTIONAL - RUN THIS ON TIMER END
    after : () => { alert("TIMER HAS ENDED!"); }
  });
};

document.querySelectorAll('.button').forEach(button => {

  let div = document.createElement('div'),
      letters = button.textContent.trim().split('');

  function elements(letter, index, array) {

      let element = document.createElement('span'),
          part = (index >= array.length / 2) ? -1 : 1,
          position = (index >= array.length / 2) ? array.length / 2 - index + (array.length / 2 - 1) : index,
          move = position / (array.length / 2),
          rotate = 1 - move;

      element.innerHTML = !letter.trim() ? '&nbsp;' : letter;
      element.style.setProperty('--move', move);
      element.style.setProperty('--rotate', rotate);
      element.style.setProperty('--part', part);

      div.appendChild(element);

  }

  letters.forEach(elements);

  button.innerHTML = div.outerHTML;

  button.addEventListener('mouseenter', e => {
      if(!button.classList.contains('out')) {
          button.classList.add('in');
      }
  });

  button.addEventListener('mouseleave', e => {
      if(button.classList.contains('in')) {
          button.classList.add('out');
          setTimeout(() => button.classList.remove('in', 'out'), 950);
      }
  });

});
