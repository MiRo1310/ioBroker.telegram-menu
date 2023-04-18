![Logo](admin/telegram-menu.png)

# ioBroker.telegram-menu

[![NPM version](https://img.shields.io/npm/v/iobroker.telegram-menu.svg)](https://www.npmjs.com/package/iobroker.telegram-menu)
[![Downloads](https://img.shields.io/npm/dm/iobroker.telegram-menu.svg)](https://www.npmjs.com/package/iobroker.telegram-menu)
![Number of Installations](https://iobroker.live/badges/telegram-menu-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/telegram-menu-stable.svg)

[![NPM](https://nodei.co/npm/iobroker.telegram-menu.png?downloads=true)](https://nodei.co/npm/iobroker.telegram-menu/)

**Tests:** ![Test and Release](https://github.com/MiRo1310/ioBroker.telegram-menu/workflows/Test%20and%20Release/badge.svg)

## telegram-menu adapter for ioBroker

Easily create Telegram Menus

You can create a separate menu for each user, or you can use the global user to generate the same menu for all users.

### Navigation

-   The call text is called by the button, both must have the same name
-   Buttons should be seperate by , and rows by &&
-   All users must be spelled exactly as they are created in telegram

### SetState

### GetState

-   You can place the Value in the Text with the Placeholder of &&

## Changelog

<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->
### 0.0.3 (2023-04-18)

-   Fixed SetState and GetState
-   Translate

### 0.0.2 (2023-04-16)

-   (MiRo1310) initial release

## License

MIT License

Copyright (c) 2023 MiRo1310 <michael.roling@gmx.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
