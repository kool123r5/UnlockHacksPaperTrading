const db = firebase.firestore();
const auth = firebase.auth();
const cashH1 = document.getElementById('cashH1');
const inputtedStock = document.getElementById('inputtedStock');
const theChart = document.getElementById('myChart');
const chartDiv = document.getElementById('chartDiv')
const buyingForm = document.getElementById('buyingForm');
const numberOfShares = document.getElementById('numberOfShares');
const inputtedSellStock = document.getElementById('inputtedSellStock');
const sellingForm = document.getElementById('sellingForm');
const numberOfSoldShares = document.getElementById('numberOfSoldShares');
const sidebar = document.getElementById("sidebar");
const sideButton = document.getElementById('sideButton');
const portfolio = document.getElementById('portfolio')

// first graph has to be total portfolio

var init = function(){
    auth.onAuthStateChanged(function(user) {
        if (user) {
            let userDocument = db.collection('user').doc(`${user.displayName}`)
            var cash;

            userDocument.get().then((doc) => {
                if (doc.exists) {
                    cash = doc.data().cash
                    cashH1.innerText = `Cash: ${cash}`
                } else {
                    cash = 5000
                    userDocument.set({
                        'cash': cash,
                        'stocks': []
                    })
                    cashH1.innerText = `Cash: ${cash}`
                }
            })

            var stockData = [];
            var color = '#00c804'
            function getColor(openingPrice, closingPrice) {
                if (parseFloat(closingPrice) - parseFloat(openingPrice) > 0) {
                    color = '#00c804'
                    return color
                } else if (parseFloat(closingPrice) - parseFloat(openingPrice) == 0) {
                    color = '#343a3f'
                    return color
                } else {
                    color ='#ab441e'
                    return color
                }
            }

            async function getData(ticker, boolean, numberOfShares) {
                var response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${ticker}&interval=1min&apikey=SJBEH6AQB8KH4K7D.json`)
                var realData = await response.json()
                stockData = []
                var x = [];
                var realSplitTime = [];
                const labels = [Object.getOwnPropertyNames(realData["Time Series (1min)"])];
                var time = labels.forEach((elem) => {
                    elem.forEach((txt) => {
                        x.push(txt)
                        var notFullySplitTime = txt.split(' ')[1]
                        var splitTime = notFullySplitTime.substring(0, 5)
                        realSplitTime.push(splitTime)
                    })
                })
                


                const gettingStockData = x.forEach((elem) => {
                    const stockDataPush = realData["Time Series (1min)"][elem]['4. close'];
                    stockData.push(stockDataPush)
                })

                var color = getColor(stockData[99], stockData[0])

                const data = {
                    labels: realSplitTime.reverse(),
                        datasets: [{
                            label: 'Porfolio',
                            data: stockData.reverse(),
                            fill: false,
                            borderColor: color,
                            tension: 0.1
                        }]
                };


                const ctx = document.getElementById('myChart').getContext('2d');
                const myChart = new Chart(ctx, {
                    type: 'line',
                    data: data,
                    options: {
                        maintainAspectRatio: false
                    }
                });

                if (boolean == true) {
                    if (parseInt(stockData[99] * numberOfShares) > parseInt(cashH1.innerText.split(' ')[1])) {
                        document.getElementById('error').innerText = 'You do not have enough money to buy this stock.'
                    } else {
                        userDocument.get().then((doc) => {
                            if (doc.exists) {
                                // they have a document
                                var newArray = doc.data().stocks.filter(function (el)
                                {
                                    return el.ticker == ticker
                                });
                                if (newArray.at(-1) == undefined) {
                                    userDocument.update({
                                        cash: firebase.firestore.FieldValue.increment(-stockData[99] * numberOfShares),
                                        stocks: firebase.firestore.FieldValue.arrayUnion({
                                            'ticker': ticker,
                                            'number': numberOfShares
                                        })
                                    }).then(() => {
                                        userDocument.get().then((doc) => {
                                            if (doc.exists) {
                                                cash = doc.data().cash
                                                cashH1.innerText = `Cash: ${cash}`
                                            } else {
                                                cash = 5000
                                                userDocument.set({
                                                    'cash': cash,
                                                    'stocks': [{
                                                        'ticker': '',
                                                        'number': 0
                                                    }]
                                                })
                                                cashH1.innerText = `Cash: ${cash}`
                                            }
                                        })
                                    })
                                } else {
                                    var newNumber = parseInt(numberOfShares) + parseInt(newArray.at(-1).number)
                                    userDocument.update({
                                        cash: firebase.firestore.FieldValue.increment(-stockData[99] * numberOfShares),
                                        stocks: firebase.firestore.FieldValue.arrayUnion({
                                            'ticker': ticker,
                                            'number': `${newNumber}`
                                        })
                                    }).then(() => {
                                        userDocument.get().then((doc) => {
                                            if (doc.exists) {
                                                cash = doc.data().cash
                                                cashH1.innerText = `Cash: ${cash}`
                                            } else {
                                                cash = 5000
                                                userDocument.set({
                                                    'cash': cash,
                                                    'stocks': [{
                                                        'ticker': '',
                                                        'number': 0
                                                    }]
                                                })
                                                cashH1.innerText = `Cash: ${cash}`
                                            }
                                        })
                                    })
                                }
                            } else {
                                // no document
                                cash = 5000
                                userDocument.set({
                                    'cash': cash,
                                    'stocks': [{
                                        'ticker': '',
                                        'number': 0
                                    }]
                                })
                                cashH1.innerText = `Cash: ${cash}`
                            }
                        }
                    )}
                } else {
                    
                }

                if (boolean == false) {
                    userDocument.get().then((doc) => {
                        if (doc.exists) {
                            // they have a document
                            var newArray = doc.data().stocks.filter(function (el)
                            {
                                return el.ticker == ticker
                            });

                            if (newArray.at(-1) == undefined) {
                                // dont own the stock
                                document.getElementById('error').innerText = 'You do not own this stock.'
                            } else {
                                // do own the stock
                                if (parseInt(newArray.at(-1).number) < parseInt(numberOfShares)) {
                                    // do not own enough shares
                                    document.getElementById('error').innerText = `You own ${newArray.at(-1).number} shares, not ${numberOfShares}`
                                } else {
                                    // owns either enough or more shares
                                    if (parseInt(newArray.at(-1).number) == parseInt(numberOfShares)) {
                                        // owns just enough shares to sell
                                        userDocument.update({
                                            cash: firebase.firestore.FieldValue.increment(stockData[99] * numberOfShares),
                                            stocks: firebase.firestore.FieldValue.arrayRemove({
                                                'ticker': ticker,
                                                'number': numberOfShares
                                            })
                                        }).then(() => {
                                            userDocument.get().then((doc) => {
                                                if (doc.exists) {
                                                    cash = doc.data().cash
                                                    cashH1.innerText = `Cash: ${cash}`
                                                } else {
                                                    cash = 5000
                                                    userDocument.set({
                                                        'cash': cash,
                                                        'stocks': [{
                                                            'ticker': '',
                                                            'number': 0
                                                        }]
                                                    })
                                                    cashH1.innerText = `Cash: ${cash}`
                                                }
                                            })
                                        })
                                    } else {
                                        // owns more shares than hes selling
                                        var diffStockCount = parseInt(newArray.at(-1).number) - parseInt(numberOfShares)
                                        userDocument.update({
                                            cash: firebase.firestore.FieldValue.increment(stockData[99] * numberOfShares),
                                            stocks: firebase.firestore.FieldValue.arrayUnion({
                                                'ticker': ticker,
                                                'number': `${diffStockCount}`
                                            })
                                        }).then(() => {
                                            userDocument.get().then((doc) => {
                                                if (doc.exists) {
                                                    cash = doc.data().cash
                                                    cashH1.innerText = `Cash: ${cash}`
                                                } else {
                                                    cash = 5000
                                                    userDocument.set({
                                                        'cash': cash,
                                                        'stocks': [{
                                                            'ticker': '',
                                                            'number': 0
                                                        }]
                                                    })
                                                    cashH1.innerText = `Cash: ${cash}`
                                                }
                                            })
                                        })
                                    }
                                }
                            }

                        } else {
                            // no document
                            cash = 5000
                            userDocument.set({
                                'cash': cash,
                                'stocks': [{
                                    'ticker': '',
                                    'number': 0
                                }]
                            })
                            cashH1.innerText = `Cash: ${cash}`
                        }
                    })
                } else {
                    
                }

                return stockData
            }

            var priceToday;
            var percentageChange;

            async function getDailyData(ticker) {
                var response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=SJBEH6AQB8KH4K7D.json`)
                var realDailyData = await response.json()
                var dailyData = realDailyData["Time Series (Daily)"]
                const dailyLabels = realDailyData == null ? 0 : [Object.getOwnPropertyNames(realDailyData["Time Series (Daily)"])];
                var lastTwoList = [dailyLabels[0][1],dailyLabels[0][0]]
                priceToday = parseFloat(dailyData[lastTwoList[1]]["4. close"])
                var priceYesterday = dailyData[lastTwoList[0]]["4. close"]
                percentageChange = (parseFloat(priceToday) - parseFloat(priceYesterday)) / priceYesterday * 100
                percentageChange = percentageChange.toFixed(2)
                priceToday = priceToday.toFixed(2)
                return [priceToday, percentageChange]
            }

            var tickers = []
            var tk = []

            userDocument.get().then((doc) => {
                if (doc.exists) {
                    var newArray = doc.data().stocks.filter((elem) => {
                        var ticker = elem.ticker
                        return ticker
                    })
                    newArray.forEach((elem) => {
                        var tk = elem.ticker
                        if(tickers.includes(tk) == true){
                            return
                        } else{
                            tickers.push(tk)
                        }
                    })
                    for (let i = 0; i < tickers.length; i++) {
                        const element = tickers[i];
                        var changingList = []
                        newArray.forEach((elem)=>{
                            if(elem.ticker == tickers[i]){
                                changingList.push(elem.number)
                            }
                        })
                        tk.push(changingList)
                    }
                    
                    tk.forEach((elem)=>{
                        console.log(elem.slice(-1)[0])
                    })
                    var priceArray = [];
                    var totalValueHoldings =[];
                    var sum = 0;
                    tickers.forEach((elem) => {
                        var newh3 = document.createElement('h3')
                        var values = getDailyData(elem)
                        Promise.resolve(values).then(res => {
                            var data = JSON.stringify(res)
                            console.log(data)
                            var price = data.split(',')[0].replace('"', '').replace('"', '').replace('[', '')
                            priceArray.push(price)
                            var percentage = data.split(',')[1].replace('"', '').replace('"', '').replace(']', '')
                            newh3.innerText = `${elem}: $${price} ${percentage}%`
                            sidebar.appendChild(newh3)
                            userDocument.get().then((doc) => {
                                if (doc.exists) {
                                    cash = doc.data().cash
                                    for (let i = 0; i < priceArray.length; i++) {
                                        var numberOfSharesOfTicker = tk[i]
                                        var valueOfOneHolding = parseFloat(numberOfSharesOfTicker) * parseFloat(priceArray[i])
                                        totalValueHoldings.push(valueOfOneHolding)
                                        sum += totalValueHoldings[i];
                                        var totalPortfolioValue = parseFloat(cash) + parseFloat(sum)
                                        console.log(totalPortfolioValue)
                                        portfolio.innerText = `Portfolio Value is $${totalPortfolioValue}`
                                    }
                                } else {
                                    cash = 5000
                                    userDocument.set({
                                        'cash': cash,
                                        'stocks': [{
                                            'ticker': '',
                                            'number': 0
                                        }]
                                    })
                                    cashH1.innerText = `Cash: ${cash}`
                                }
                            })
                        })
                    })
                } else {
                    cash = 5000
                    userDocument.set({
                        'cash': cash,
                        'stocks': [{
                            'ticker': '',
                            'number': 0
                        }]
                    })
                    cashH1.innerText = `Cash: ${cash}` 
                }
            })
            
            inputtedStock.onchange = () => {
                var value = inputtedStock.value;
                getData(value)
            }

            buyingForm.onsubmit = (e) => {
                e.preventDefault()
                var value = inputtedStock.value;
                var numberOfSharesValue = numberOfShares.value;
                getData(value, true, numberOfSharesValue)
            }

            inputtedSellStock.onchange = () => {
                var value = inputtedSellStock.value;
                getData(value)
            }

            sellingForm.onsubmit = (e) => {
                e.preventDefault()
                var value = inputtedSellStock.value;
                var numberOfSoldSharesValue = numberOfSoldShares.value;
                getData(value, false, numberOfSoldSharesValue)
            }

        } else {
          window.location = 'login.html'
        }
    });
}
    
init();

