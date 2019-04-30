
---------------------------------------------------------------------------------
               ______      __            ____              _
              /_  __/_  __/ /_  ___     / __ \____ _____  (_)____
               / / / / / / __ \/ _ \   / /_/ / __ `/ __ \/ / ___/
              / / / /_/ / /_/ /  __/  / ____/ /_/ / / / / / /__
             /_/  \__,_/_.___/\___/  /_/    \__,_/_/ /_/_/\___/

---------------------------------------------------------------------------------

HISTORY

Before the transistor was invented, computers used vacuum tubes as switches.
These vacuum tubes however were rather fragile and would regularly fail.
In this game you are tasked with maintaining one of these computers,
the ENIAC, the very first electronic general-purpose computer.
You will need to replace the failed tubes to keep the computer running.
The longer you keep it running, the higher your score will be.
If all boards fail, you loose the game.
Computers were very high maintenance back in the day, something the
six women responsible for programming the ENIAC could attest to.

---------------------------------------------------------------------------------

RUNNING IT

Make sure you have Node.js >= 10 installed. See https://nodejs.org/en/ for
installation instructions.

Run `npx tube-panic` on your command line to play the game.
If you prefer you can also clone this repository and start the game with
`node index.js`.

---------------------------------------------------------------------------------

CONTROLS

w=forwards
a=left
s=backwards
d=right
e=replace tube

ctrl+c=exit game

---------------------------------------------------------------------------------

DESCRIPTION

B - Boards
Boards need maintenance as soon as they flare up red. Move infront of the failed
board and change the tube. You need to be facing the board in order to repair it.

W - Wall
Walls block your movement.

A, V, <, > - You
This indicates the direction you are facing.

---------------------------------------------------------------------------------


LICENSE

Tube Panic - Copyright (C) 2019 Team lol

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

To see the respective General Public License visit: http://www.gnu.org/licenses/.

---------------------------------------------------------------------------------
