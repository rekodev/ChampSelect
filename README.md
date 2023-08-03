# ChampSelect

ChampSelect is a search and filter tool for League of Legends (LoL) champions. This project was built to practice JavaScript, HTML, and CSS, and while the codebase is continuously being improved, it serves as an excellent resource for LoL players and enthusiasts. It allows users to search for champions by name and filter them based on their role, position, and difficulty level.

The application is live and can be accessed [here](https://rekodev.github.io/ChampSelect/).

## Features

- **Search**: Look up champions by their name.
- **Filter**: Sort through champions based on their role (Assassin, Fighter, Mage, Marksman, Support, Tank), position (Top, Jungle, Mid, Bottom, Support), and difficulty (from 1 to 3).
- **Champion Information**: Get detailed information on a specific champion, including champion type, role, difficulty, lore, and ability information. Each ability comes with a quick video preview.
- **Links for Champion Mastery**: Links are provided to external resources such as u.gg and probuilds.gg for further champion mastery guidance.

## How It Works

By default, all 163 champions are displayed on the screen. As you search or apply filters, the number of displayed champions decreases accordingly. The filters work in combination with each other. For example, if you set the filters to Assassin, Top, and Difficulty 1, you'll only get Fiora.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

To run this application, you need a modern web browser that supports ES6 (like Chrome, Firefox, Safari, or Edge).

### Installation

1. Clone this repository using `git clone https://github.com/rekodev/ChampSelect.git`.
2. Open the `index.html` file in your web browser.

## Built With

- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) - The Web's core language for creating content.
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) - Style sheet language used for describing the look and formatting of a document written in HTML.
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - High-level, interpreted programming language.

## Data Source

This project uses data from the following APIs:

- [Riot Games API](https://developer.riotgames.com/docs/lol)
- [Meraki Analytics API](https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/championrates.json) (Data copied into local `championrates.json` file)

## Authors

- **rekodev** - _Initial work_ - [rekodev](https://github.com/rekodev)

## Acknowledgments

- Riot Games for providing the champion data.
- Meraki Analytics for the champion rates data.
