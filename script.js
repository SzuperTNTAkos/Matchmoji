async function getch(url){
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

function ranint(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function shuffle(array){
    for (let i = 0; i < array.length; i++) {
        const target = ranint(i, array.length)
        const temp = array[i]
        array[i] = array[target]
        array[target] = temp
    }
}



const rowcount = 5
let solved = false
let board = []
async function categorielist(len) {
    let categories = await getch('https://emojihub.yurace.pro/api/categories')
    let result = []
    if(len > categories.length){
        throw new Error("There are not that many categories");   
    }
    for (let i = 0; i < len; i++) {
        const index = ranint(0, categories.length)
        result.push(categories[index])
        categories.splice(index, 1)
    }
    return result
}

function swap(num1, column1, num2, column2){
    const val1 = board[column1][num1]
    const val2 = board[column2][num2]
    board[column1][num1] = val2
    board[column2][num2] = val1
    const pos1 = document.getElementById(`${num1}-${column1}`)
    const pos2 = document.getElementById(`${num2}-${column2}`)
    pos1.innerHTML = val2
    pos2.innerHTML = val1
}

let currentlySelected = {num: null, column: null}
function clicked(num, column) {
    if(!solved){
        if(currentlySelected.num === num && currentlySelected.column === column){
            const old = document.getElementById(`${currentlySelected.num}-${currentlySelected.column}`)
            old.classList.remove('active')
            currentlySelected = {num: null, column: null}
        }
        else if(currentlySelected.num !== null){
            const old = document.getElementById(`${currentlySelected.num}-${currentlySelected.column}`)
            old.classList.remove('active')
            swap(currentlySelected.num, currentlySelected.column, num, column)
            currentlySelected.num = null
            currentlySelected.column = null
        }
        else{
            const old = document.getElementById(`${num}-${column}`)
            old.classList.add('active')
            currentlySelected.num = num
            currentlySelected.column = column
        }
    }
}

let solution
function solve(){
    solved = true
    document.getElementById('solvebutton').hidden = true
    document.getElementById('retrybutton').hidden = false
    for (let i = 0; i < solution.length; i++) {
        const template = document.getElementById(`${i}-template`)
        template.classList.add(board[0][i] === solution[i] ? 'right' : 'wrong')
    }
}

function retry(){
    const primaryList = document.getElementById('primary-list');
    const secondaryList = document.getElementById('secondary-list');
    const retryButton = document.getElementById('retrybutton');
    const checkbutton = document.getElementById('solvebutton');
    const root = document.getElementById('root')
    root.hidden = true
    retryButton.hidden = true
    checkbutton.hidden = false
    primaryList.innerHTML = '';
    secondaryList.innerHTML = '';
    solved = false
    board = []
    currentlySelected = {num: null, column: null}
    main(rowcount)
}

async function main(emojicount) {
    const root = document.getElementById('root')
    const primaryList = document.getElementById('primary-list')
    const secondaryList = document.getElementById('secondary-list')
    let categories = await categorielist(emojicount)
    let pairs = []
    board.push(Array(emojicount).fill('X'))
    for (let i = 0; i < emojicount; i++) {
        pairs.push({
            location: `${i}-options`,
            emoji: getch(`https://emojihub.yurace.pro/api/random/category/${categories[i]}`),
            pair: getch(`https://emojihub.yurace.pro/api/random/category/${categories[i]}`)
        })
    }
    for (let i = 0; i < emojicount; i++) {
        pairs[i].emoji = await pairs[i].emoji
        pairs[i].pair = await pairs[i].pair
    }
    solution = pairs.map((x) => x.pair.htmlCode[0])
    let originalpairs = pairs.map((x) => x)
    shuffle(pairs)
    board.push(pairs.map((x) => x.pair.htmlCode[0]))
    for (let i = 0; i < pairs.length; i++) {        
        const primaryChild = document.createElement('li')
        const left = document.createElement('div')
        left.setAttribute('id', `${i}-template`)
        left.innerHTML = originalpairs[i].emoji.htmlCode[0]
        primaryChild.appendChild(left)
        const empty = document.createElement('button')
        empty.setAttribute('id', `${i}-0`)
        empty.addEventListener('click', () => clicked(i, 0))
        empty.innerHTML = 'X'
        primaryChild.appendChild(empty)
        primaryList.appendChild(primaryChild)
        const secondaryChild = document.createElement('li')
        const childDiv = document.createElement('button')
        childDiv.setAttribute('id', `${i}-1`)
        childDiv.addEventListener('click', () => clicked(i, 1))
        childDiv.innerHTML = pairs[i].pair.htmlCode[0]
        secondaryChild.appendChild(childDiv)
        secondaryList.appendChild(secondaryChild)
    }
    root.hidden = false
}

main(rowcount)