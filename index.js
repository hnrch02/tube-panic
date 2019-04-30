const fs = require('fs')
const chalk = require('chalk')
const readline = require('readline')
const title = fs.readFileSync('title.txt')

var GameState = -1
var Score = 0
var StepCount = 0
var Level = []
var CurrPos = {
  x: 0,
  y: 0,
  dir: 'A'
}
const Boards = []
// boards states: ok, fire

const parseLevel = (path) => {
  Level = fs.readFileSync(path).toString().split('\n')
  Level = Level.map(line => line.replace('\r', '').replace('\n', '').split(''))
  Level.forEach((line, lineIndex) => {
    line.forEach((char, columnPos) => {
      if (char === 'P') {
        CurrPos.x = columnPos
        CurrPos.y = lineIndex
        Level[lineIndex][columnPos] = ' ';
      } else if (char === 'B') {
        Boards.push({
          x: columnPos,
          y: lineIndex
        })
        Level[lineIndex][columnPos] = {
          char: 'B',
          state: 'ok'
        }
      }
    })
  })
}

const charAt = (x, y) => {
  return Level[y][x]
}

const move = () => {
  ++StepCount
  Score += 10 * StepCount

  let rnd = getRandomInt(1000) + StepCount * 2

  if (rnd > 750) {
    let okBoards = Boards.filter(pos => {
      return Level[pos.y][pos.x].state === 'ok'
    })

    if (okBoards.length === 0) {
      GameState = 1
      return
    }

    let selectedBoard = okBoards[getRandomInt(okBoards.length - 1)]
    Level[selectedBoard.y][selectedBoard.x].state = 'fire'
  }
}

const moveUp = () => {
  CurrPos.dir = 'A'

  if (charAt(CurrPos.x, CurrPos.y - 1) === ' ') {
    Level[CurrPos.y][CurrPos.x] = ' ';
    --CurrPos.y;
    move()
  }
}

const moveDown = () => {
  CurrPos.dir = 'V'

  if (charAt(CurrPos.x, CurrPos.y + 1) === ' ') {
    Level[CurrPos.y][CurrPos.x] = ' ';
    ++CurrPos.y;
    move()
  }
}

const moveLeft = () => {
  CurrPos.dir = '<'

  if (charAt(CurrPos.x - 1, CurrPos.y) === ' ') {
    Level[CurrPos.y][CurrPos.x] = ' ';
    --CurrPos.x;
    move()
  }
}

const moveRight = () => {
  CurrPos.dir = '>'

  if (charAt(CurrPos.x + 1, CurrPos.y) === ' ') {
    Level[CurrPos.y][CurrPos.x] = ' ';
    ++CurrPos.x;
    move()
  }
}

const interact = () => {
  let lookingAt

  switch (CurrPos.dir) {
    case 'A':
      lookingAt = Level[CurrPos.y - 1][CurrPos.x]
      break
    case 'V':
      lookingAt = Level[CurrPos.y + 1][CurrPos.x]
      break
    case '<':
      lookingAt = Level[CurrPos.y][CurrPos.x - 1]
      break
    case '>':
      lookingAt = Level[CurrPos.y][CurrPos.x + 1]
      break
  }

  if (lookingAt.char && lookingAt.state === 'fire') {
    lookingAt.state = 'ok'
    Score += 20 * StepCount
  }
}

parseLevel('lvl_1.txt')

// source: MDN
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const render = () => {
  console.clear()
  console.log('SCORE:', Score)
  console.log()
  // console.log('curr pos: ', CurrPos)
  // console.log('step count: ', StepCount)

  Level.forEach((line, y) => {
    line.forEach((char, x) => {
      if (CurrPos.y === y && CurrPos.x === x) {
        char = chalk.blue(CurrPos.dir)
      }

      if (char.char && char.state === 'fire') {
        char = chalk.red(char.char)
      }

      if (char.char) char = char.char
      process.stdout.write(char)
    })
    console.log('')
  })

  if (GameState === 1) {
    console.log()
    console.log('GAME OVER!')
    console.log('SCORE:', Score)
    console.log()
    console.log('Press Ctrl+C to quit')
  }
}

readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') return process.exit()
  if (GameState === -1 && key.name === 's') {
    GameState = 0
    return render()
  }
  if (GameState === 1 || GameState === -1) return

  switch (key.name) {
    case 'w':
      moveUp();
      break;
    case 'a':
      moveLeft()
      break
    case 's':
      moveDown()
      break
    case 'd':
      moveRight()
      break
    case 'e':
      interact()
      break
  }

  render()
})

console.clear()
console.log(title.toString())
console.log()
console.log(chalk.green('                 Press [s] to start'))