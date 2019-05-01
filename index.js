#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const endl = require('os').EOL
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
const centerPrefix = (length) => ' '.repeat((process.stdout.getWindowSize()[0] - length) / 2)
const center = (text) => centerPrefix(text.length) + text

readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c')
    return process.exit(0)
})

class Game {
  constructor (filePath, debug, onEnd) {
    this.debug = debug
    this.state = 0 // 0 = running, 1 = game over
    this.score = 0
    this.stepCount = 0
    this.level = []
    this.listener = this.onKeypress.bind(this)
    this.onEnd = onEnd
    this.maxLineLength = 0
    this.pos = {
      x: 0,
      y: 0,
      dir: 'A'
    }
    this.failable = []

    this.parseLevel(filePath)
    this.attachKeyboardEvent()
    this.render()
  }

  parseLevel (filePath) {
    let level = fs.readFileSync(filePath).toString().split(endl)
    level = level.map(line => {
      line = line.replace('\r', '').replace(endl, '')
      if (line.length > this.maxLineLength) this.maxLineLength = line.length
      return line.split('')
    })
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

  attachKeyboardEvent () {
    process.stdin.on('keypress', this.listener)
  }

  detachKeyboardEvent () {
    process.stdin.off('keypress', this.listener)
  }

  onKeypress (str, key) {
    if (this.state === 1)
      return this.end()

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
  }

  render () {
    console.clear()
    let output = endl + center(`SCORE: ${this.score}`) + endl + endl

    if (this.debug) {
      console.log(center(`current pos: { x: ${this.pos.x}, y: ${this.pos.y} }`))
      console.log(center(`step count: ${this.stepCount}`))
      console.log(center(`last rand: ${this.lastRand}`), endl)
    }

    this.level.forEach((line, y) => {
      output += centerPrefix(this.maxLineLength)
      line.forEach((char, x) => {
        if (Game.WALL.indexOf(char) !== -1)
          char = color('Dim', char)

        if (this.pos.y === y && this.pos.x === x)
          char = color('FgBlue', this.pos.dir)

        if (char.char && char.failed)
          char = color('FgRed', char.char)
        else if (char.char)
          char = char.char

        output += char
      })
      output += endl
    })

    process.stdout.write(output)

    if (this.state === 1) {
      console.log(endl, center('GAME OVER!'))
      console.log(center(`SCORE: ${this.score}`), endl)
      console.log(center('Press any key to continue'))
    }
  }

  move (x, y) {
    if (this.level[y][x] === Game.EMPTY) {
      this.level[this.pos.y][this.pos.x] = Game.EMPTY
      this.pos.x = x
      this.pos.y = y
    } else return

    ++this.stepCount
    this.score += this.stepCount * 10

    let rand = getRandomInt(1000) + this.stepCount * 2

    if (this.debug) this.lastRand = rand

    if (rand > 750) {
      let selectedIndex = getRandomInt(this.failable.length - 1)
      let selected = this.failable[selectedIndex]

      this.level[selected.y][selected.x].failed = true
      this.failable.splice(selectedIndex, 1)

      if (this.failable.length === 0)
        this.state = 1
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

  end () {
    this.detachKeyboardEvent()
    this.onEnd()
  }
}

Game.PLAYER = 'P'
Game.BOARD = 'B'
Game.WALL = ['W', '╯', '╰', '─', '│', '╮', '╭']
Game.EMPTY = ' '

Game.UP = 'A'
Game.DOWN = 'V'
Game.LEFT = '<'
Game.RIGHT = '>'

class Menu {
  constructor (dirPath) {
    this.debug = false
    this.levels = []
    this.selected = 0
    this.listener = this.onKeypress.bind(this)

    this.getLevels(dirPath)
    this.attachKeyboardEvent()
    this.render()
  }

  getLevels (dirPath) {
    this.levels = fs.readdirSync(dirPath).map((filename, index) => ({
      name: path.basename(filename, '.txt').replace('_', ' '),
      filename: path.resolve(dirPath, filename)
    }))
  }

  attachKeyboardEvent () {
    process.stdin.on('keypress', this.listener)
  }

  detachKeyboardEvent () {
    process.stdin.off('keypress', this.listener)
  }

  onKeypress (str, key) {
    if (key.ctrl && key.name === 'd') this.debug = true

    switch (key.name) {
      case 'up':
      case 'w':
        if (this.selected > 0) --this.selected
        break
      case 'down':
      case 's':
        if (this.selected < this.levels.length - 1) ++this.selected
        break
      case 'return':
      case 'space':
        return this.start()
    }

    this.render()
  }

  render () {
    console.clear()
    console.log()
    title.toString().split(endl).forEach(line => console.log(center(line)))
    console.log()

    this.levels.forEach((level, index) => {
      if (this.selected === index) {
        let name = `[ ${level.name} ]`
        console.log(centerPrefix(name.length) + color('BgWhite', color('FgBlack', name)))
      } else
        console.log(center(level.name))
    })

    console.log(endl, color('Dim', center('Use [up] or [down] to select level')))
    console.log(endl, color('FgGreen', center('Press [enter] to start')))
  }

  start () {
    this.detachKeyboardEvent()

    new Game(this.levels[this.selected].filename, this.debug, () => {
      this.attachKeyboardEvent()
      this.render()
    })
  }
}

new Menu('levels/')