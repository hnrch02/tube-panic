const fs = require('fs')
const readline = require('readline')
const EOL = require('os').EOL
const title = fs.readFileSync('title.txt')

// Kudos to StackOverflow https://stackoverflow.com/a/41407246/3059393
const colors = {
  "Reset": "\x1b[0m",
  "Bright": "\x1b[1m",
  "Dim": "\x1b[2m",
  "Underscore": "\x1b[4m",
  "Blink": "\x1b[5m",
  "Reverse": "\x1b[7m",
  "Hidden": "\x1b[8m",

  "FgBlack": "\x1b[30m",
  "FgRed": "\x1b[31m",
  "FgGreen": "\x1b[32m",
  "FgYellow": "\x1b[33m",
  "FgBlue": "\x1b[34m",
  "FgMagenta": "\x1b[35m",
  "FgCyan": "\x1b[36m",
  "FgWhite": "\x1b[37m",

  "BgBlack": "\x1b[40m",
  "BgRed": "\x1b[41m",
  "BgGreen": "\x1b[42m",
  "BgYellow": "\x1b[43m",
  "BgBlue": "\x1b[44m",
  "BgMagenta": "\x1b[45m",
  "BgCyan": "\x1b[46m",
  "BgWhite": "\x1b[47m"
}

const color = (name, text) => `${colors[name]}${text}${colors['Reset']}`
const getRandomInt = max => Math.floor(Math.random() * Math.floor(max)) // https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Math/math.random

readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)

class Game {
  constructor (path) {
    this.debug = false
    this.state = 0
    this.score = 0
    this.stepCount = 0
    this.level = []
    this.pos = {
      x: 0,
      y: 0,
      dir: 'A'
    }
    this.failable = []

    this.parseLevel(path)
    this.setup()
  }

  parseLevel (path) {
    let level = fs.readFileSync(path).toString().split(EOL)
    level = level.map(line => line.replace('\r', '').replace(EOL, '').split(''))
    level.forEach((line, y) => line.forEach((char, x) => {
      if (char === Game.PLAYER) {
        this.pos = { x, y, dir: 'A' }
        level[y][x] = Game.EMPTY
      } else if (char === Game.BOARD) {
        this.failable.push({ x, y })
        level[y][x] = {
          char: Game.BOARD,
          failed: false
        }
      }
    }))
    this.level = level
  }

  setup () {
    process.stdin.on('keypress', (str, key) => {
      if (key.ctrl && key.name === 'c') return process.exit(0)
      if (this.state === 0 && key.ctrl && key.name === 'd') this.debug = true
      if (this.state === 0 && key.name === 's') {
        this.state = 1
        return this.render()
      }
      if (this.state !== 1) return

      switch (key.name) {
        case 'w':
          this.moveUp()
          break
        case 'a':
          this.moveLeft()
          break
        case 's':
          this.moveDown()
          break
        case 'd':
          this.moveRight()
          break
        case 'e':
          this.interact()
          break
      }

      this.render()
    })

    console.clear()
    console.log(title.toString())
    console.log()
    console.log(color('FgGreen', '               Press [s] to start'))
  }

  render () {
    console.clear()
    console.log('SCORE:', this.score)
    console.log()

    if (this.debug) {
      console.log('current pos:', this.pos)
      console.log('step count:', this.stepCount)
      console.log('last rand:', this.lastRand)
      console.log()
    }

    this.level.forEach((line, y) => {
      line.forEach((char, x) => {
        if (char === Game.WALL)
          char = color('Dim', char)

        if (this.pos.y === y && this.pos.x === x)
          char = color('FgBlue', this.pos.dir)

        if (char.char && char.failed)
          char = color('FgRed', char.char)
        else if (char.char)
          char = char.char

        process.stdout.write(char)
      })
      console.log('')
    })

    if (this.state === 2) {
      console.log()
      console.log('GAME OVER!')
      console.log('SCORE:', this.score)
      console.log()
      console.log('Press Ctrl+C to quit')
    }
  }

  move (x, y) {
    if (this.level[y][x] === Game.EMPTY) {
      this.level[this.pos.y][this.pos.x] = Game.EMPTY
      this.pos.x = x
      this.pos.y = y
    }

    ++this.stepCount
    this.score += this.stepCount * 10

    let rand = getRandomInt(1000) + this.stepCount * 2

    if (this.debug) this.lastRand = rand

    if (rand > 750) {
      if (this.failable.length === 0)
        return this.state = 2

      let selectedIndex = getRandomInt(this.failable.length - 1)
      let selected = this.failable[selectedIndex]

      this.level[selected.y][selected.x].failed = true
      this.failable.splice(selectedIndex, 1)
    }
  }

  moveUp () {
    this.pos.dir = Game.UP
    this.move(this.pos.x, this.pos.y - 1)
  }

  moveDown () {
    this.pos.dir = Game.DOWN
    this.move(this.pos.x, this.pos.y + 1)
  }

  moveLeft () {
    this.pos.dir = Game.LEFT
    this.move(this.pos.x - 1, this.pos.y)
  }

  moveRight () {
    this.pos.dir = Game.RIGHT
    this.move(this.pos.x + 1, this.pos.y)
  }

  interact () {
    let { x, y } = this.pos

    switch (this.pos.dir) {
      case Game.UP:
        --y
        break
      case Game.DOWN:
        ++y
        break
      case Game.LEFT:
        --x
        break
      case Game.RIGHT:
        ++x
        break
    }

    let lookingAt = this.level[y][x]

    if (lookingAt.char && lookingAt.failed) {
      lookingAt.failed = false
      this.failable.push({ x, y })
      this.score += this.stepCount * 20
    }
  }
}

Game.PLAYER = 'P'
Game.BOARD = 'B'
Game.WALL = 'W'
Game.EMPTY = ' '

Game.UP = 'A'
Game.DOWN = 'V'
Game.LEFT = '<'
Game.RIGHT = '>'

new Game('levels/Level_1.txt')