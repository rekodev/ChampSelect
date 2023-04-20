// --- VARIABLES
const output = document.getElementById('output');
const supportButton = document.querySelector('.support');
const searchBar = document.querySelector('.search-bar');
const searchBarInput = document.querySelector('.search-bar input');
const championAmount = document.querySelector('#amount');

// GLOBAL VARIABLES TO CONNECT SEARCH BAR WITH OTHER FILTERS
let searchTerm = searchBarInput.value;
let currentNames = [];

const championParameters = document.querySelectorAll('.search-bar > div > div');
const params = document.querySelector('.parameters');
const resetButton = document.querySelector('.reset');

// Champion Info Section
const championInfoSection = document.querySelector('#champion-info');
const xMark = document.querySelector('.fa-xmark');
const championName = document.querySelector('#champion-name');
const championInfoWrapper = document.querySelector('.info');
const championAbilitiesWrapper = document.querySelector('.abilities');
const typeImageWrapper = document.querySelector('.info-type-images');
const roleImageWrapper = document.querySelector('.info-role-images');
const championAbilityImg = document.querySelectorAll('.ability img');
const championAbilityName = document.querySelectorAll(
  '.ability p:nth-child(2)'
);

// Ability Video
const abilityVideo = document.querySelector('.champion-ability-preview video');
const videoAbilityName = document.querySelector('p.ability-name');
const videoAbilityDescription = document.querySelector('p.ability-description');
const videoError = document.querySelector('.error-loading-video');

const CHAMPION_ENDPOINT = `https://ddragon.leagueoflegends.com/cdn/13.7.1/data/en_US/champion.json`;
const CHAMPION_ROLE_ENDPOINT = `https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/championrates.json`;

const diff1 = document.querySelector('#diff-1');
const diff2 = document.querySelector('#diff-2');
const diff3 = document.querySelector('#diff-3');

// --- FUNCTIONS

// LOAD ALL CHAMPIONS
function loadAllChampions() {
  const allChampions = [];

  fetch(CHAMPION_ENDPOINT)
    .then((res) => res.json())
    .then((data) => {
      const championNames = Object.keys(data.data);
      let nameCount = 0;

      championNames.forEach((name) => {
        allChampions.push(name);
        const actualChampionName = data.data[name].name;

        // IF 'name' INCLUDES SEARCH TERM
        if (
          name.toLowerCase().includes(searchTerm) ||
          actualChampionName.toLowerCase().includes(searchTerm)
        ) {
          forEachChampionName(name, actualChampionName);
          nameCount++;
        }
      });
      // championAmount.innerText = championNames.length;
      championAmount.innerText = nameCount.toString();
    });

  // SETTING CURRENT NAMES TO INCLUDE ALL 163 LOADED CHAMPIONS
  currentNames = allChampions;
}

// GENERATING CHAMPION CARDS
function forEachChampionName(name, champFullName) {
  const cardImgOverlay = document.createElement('div');
  cardImgOverlay.classList.add('card-img-overlay');

  const card = document.createElement('div');
  card.classList.add('champion-card');
  const championName = document.createElement('h6');
  const fullChampionName = document.createElement('h5');
  const championImage = document.createElement('img');
  championImage.setAttribute(
    'src',
    `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${name}_0.jpg`
  );

  championName.innerText = `${name}`;
  fullChampionName.innerText = `${champFullName}`;

  card.append(championImage, championName, fullChampionName, cardImgOverlay);

  output.append(card);
}

// PARAMETER FILTERS
function championParameterFilter() {
  championParameters.forEach((param) => {
    param.addEventListener('click', (e) => {
      const parameters = document.querySelectorAll('.champion-parameter');

      if (e.target.className.includes('difficulty')) {
        // REMOVING ALL DIFFICULTIES FROM PARAMS EXCEPT FOR THE DIFFICULTY CLICKED
        parameters.forEach((p) => {
          if (
            (p.innerText.includes('1') ||
              p.innerText.includes('2') ||
              p.innerText.includes('3')) &&
            !p.innerText.includes(`${e.target.id[e.target.id.length - 1]}`)
          ) {
            p.parentNode.removeChild(p);
          }
        });

        // REMOVING ALL ACTIVE CLASSES FROM PARAMS EXCEPT FOR THE DIFFICULTY CLICKED
        championParameters.forEach((p) => {
          if (p.className.includes('difficulty') && p != e.target)
            p.classList.remove('active');
        });
      }

      e.target.classList.toggle('active');

      // MISC COLOR PARAMETERS TO THE RIGHT OF THE CHAMPION AMOUNT
      params.classList.remove('hidden');

      if (e.target.className.includes('active')) {
        generateParams(e.target, params);
      } else {
        parameters.forEach((parameter) => {
          if (parameter.innerText.toLowerCase() === e.target.id) {
            parameter.parentNode.removeChild(parameter);
          }
        });
      }

      while (output.lastChild) {
        output.removeChild(output.lastChild);
      }

      let emptyArr = [];
      let emptyNames = [];
      let activeCheck = false;

      championParameters.forEach((param) => {
        if (param.className.includes('active')) {
          if (param.className.includes('role')) {
            emptyArr.push(param.id.toUpperCase());
          } else if (param.className.includes('type')) {
            emptyArr.push(param.id[0].toUpperCase() + param.id.slice(1));
          } else if (param.className.includes('difficulty')) {
            if (
              emptyArr[emptyArr.length - 1] === '1' ||
              emptyArr[emptyArr.length - 1] === '2' ||
              emptyArr[emptyArr.length - 1] === '3'
            )
              emptyArr.pop();

            emptyArr.push(param.id[param.id.length - 1]);
          }

          activeCheck = true;

          fetch(CHAMPION_ENDPOINT)
            .then((res) => res.json())
            .then((data) => {
              let emptyObj = {};
              const sortedData = {};
              const keyArray = [];
              const championNames = Object.keys(data.data);

              championNames.forEach((name) => {
                emptyObj[name] = data.data[name].key;
                keyArray.push(data.data[name].key);
              });

              // -----2ND FETCH-------------------------------------------------------
              fetch('./championrates.json')
                .then((res) => res.json())
                .then((data2) => {
                  keyArray.forEach((el) => {
                    sortedData[`a${el}`] = data2.data[el];
                  });

                  data2.data = sortedData;
                  const champKeys = Object.keys(data2.data);
                  // console.log(champKeys);
                  champKeys.forEach((key) => {
                    newKey = key.substring(1);
                    // console.log(newKey);

                    const tags = [];

                    for (let objKey of Object.keys(emptyObj)) {
                      if (newKey == emptyObj[objKey]) {
                        // PUSHING TAGS
                        // --- CHAMPION TYPE TAGS
                        data.data[objKey].tags.forEach((tag) => tags.push(tag));

                        for (let champLane of Object.keys(data2.data[key])) {
                          if (data2.data[key][champLane].playRate > 0) {
                            // --- CHAMPION ROLE TAGS
                            tags.push(champLane);
                          }
                        }

                        // --- CHAMPION DIFFICULTY TAGS
                        const diff = data.data[objKey].info.difficulty;
                        if (diff >= 0 && diff <= 3) tags.push('1');
                        else if (diff >= 4 && diff <= 7) tags.push('2');
                        else if (diff >= 8 && diff <= 10) tags.push('3');
                      }
                    }

                    const roleMatches = emptyArr.every((value) => {
                      return tags.includes(value);
                    });

                    for (let champion of Object.keys(emptyObj)) {
                      if (newKey == emptyObj[champion]) {
                        // IF ROLE MATCHES AND CHAMPION NAME INCLUDES SEARCH TERM
                        if (roleMatches && !emptyNames.includes(champion)) {
                          // EMPTY NAMES IS CHANGED REGARDLESS OF THE SEARCH TERM
                          emptyNames.push(champion);

                          // FINAL IF TO GENERATE CHAMPIONS BASED ON ALREADY EXISTING SEARCH TERM
                          if (
                            champion.toLowerCase().includes(searchTerm) ||
                            data.data[champion].name
                              .toLowerCase()
                              .includes(searchTerm)
                          ) {
                            forEachChampionName(
                              champion,
                              data.data[champion].name
                            );
                          }
                        }
                      }
                    }
                    // console.log(tags);
                  });
                  // championAmount.innerText = emptyNames.length;
                  championAmount.innerText =
                    document.querySelectorAll('.champion-card').length;

                  // SETTING CURRENT NAMES TO CONTAIN ALL NAMES APPLICABLE TO THE FILTERS SET
                  currentNames = emptyNames;
                });
              // ---------------------------------------------------------------------
            });
        }
      });
      // console.log(emptyArr);
      if (activeCheck === false) {
        params.classList.add('hidden');
        loadAllChampions();
      }
    });
  });
}

// DIFFICULTY FUNCTION
function difficulty(difficulty) {
  const difficultyText = document.querySelector('.info-difficulty-text');
  const difficultyBars = document.querySelectorAll('.info-difficulty-bar');
  difficultyBars.forEach((bar) => (bar.style.backgroundColor = '#5E4722'));

  if (difficulty >= 0 && difficulty <= 3) {
    difficultyBars[0].style.backgroundColor = '#C8AA6E';
    difficultyText.innerText = 'Low';
  } else if (difficulty >= 4 && difficulty <= 7) {
    difficultyBars[0].style.backgroundColor = '#C8AA6E';
    difficultyBars[1].style.backgroundColor = '#C8AA6E';
    difficultyText.innerText = 'Moderate';
  } else if (difficulty >= 8 && difficulty <= 10) {
    difficultyBars.forEach((bar) => (bar.style.backgroundColor = '#C8AA6E'));
    difficultyText.innerText = 'High';
  }
}

// INPUT CHAMPION SEARCH FUNCTION
function championSearch() {
  searchTerm = searchBarInput.value.toLowerCase();
  // console.log(currentNames);

  fetch(CHAMPION_ENDPOINT)
    .then((res) => res.json())
    .then((data) => {
      const championNames = Object.keys(data.data);

      while (output.lastChild) {
        output.removeChild(output.lastChild);
      }

      championNames.forEach((name) => {
        if (name.toLowerCase().includes(searchBarInput.value.toLowerCase())) {
          // console.log(name);
          currentNames.forEach((currentName) => {
            if (currentName === name)
              forEachChampionName(name, data.data[name].name);
          });
        }
      });
      const allCards = document.querySelectorAll('.champion-card');
      championAmount.innerText = allCards.length;
    });
}

// GENERATE PARAMETER
function generateParams(target, locationToDisplay) {
  const paramDiv = document.createElement('div');
  paramDiv.classList.add('champion-parameter');
  paramDiv.innerText = target.id.toUpperCase();
  locationToDisplay.appendChild(paramDiv);
}

// CHAMPION INFO SECTION FUNCTION
function openAndPopulateChampionInfo() {
  output.addEventListener('click', (e) => {
    if (e.target.parentNode.className.includes('champion-card')) {
      championInfoSection.style.display = 'grid';
      const cardText = e.target.parentNode.childNodes[1].innerText;
      const cardActualName = e.target.parentNode.childNodes[2].innerText;
      // championName.innerText = cardText.toUpperCase();
      championName.innerText = cardActualName.toUpperCase();
      championName.dataset.name = cardText;

      fetch(
        `https://ddragon.leagueoflegends.com/cdn/13.7.1/data/en_US/champion/${cardText}.json`
      )
        .then((res) => res.json())
        .then((data) => {
          // console.log(data.data[cardText]);

          const champion = data.data[cardText];

          const championTitle = document.createElement('span');
          championTitle.id = 'champion-title';
          championTitle.innerText = champion.title.toUpperCase();
          championName.appendChild(championTitle);

          const diff = data.data[cardText].info.difficulty;
          difficulty(diff);

          // Video
          const originalChampionKey = champion.key;
          let championKey = champion.key;
          const abilityType = document.querySelector('.ability-type');
          const abilityDescription = document.querySelector(
            '.ability-description'
          );

          // DEFAULT VIDEO VALUES
          // -- default names
          abilityDescription.innerText = champion.passive.description;
          videoAbilityName.innerText = champion.passive.name;
          abilityType.innerText = 'PASSIVE';
          championAbilityImg.forEach((abil) =>
            abil.classList.remove('active-ability')
          );

          championAbilityImg[0].classList.add('active-ability');

          if (championKey.length === 2) championKey = `0${championKey}`;
          else if (championKey.length === 1) championKey = `00${championKey}`;

          // -- default video
          abilityVideo.setAttribute(
            'src',
            `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/0${championKey}/ability_0${championKey}_P1.webm`
          );

          // abilityVideo.onerror = () => {
          //   const videoError = document.querySelector('.error-loading-video');
          //   videoError.classList.remove('error-loading-video-toggle');
          // };
          abilityVideoOnError(abilityVideo);

          // DYNAMIC SPELL IMG ADD
          champion.spells.forEach((spell, index) => {
            if (index === 0) {
              championAbilityImg[
                index
              ].src = `https://ddragon.leagueoflegends.com/cdn/13.7.1/img/passive/${champion.passive.image.full}`;
            }

            championAbilityImg[
              index + 1
            ].src = `https://ddragon.leagueoflegends.com/cdn/13.7.1/img/spell/${spell.id}.png`;

            if (index === 0)
              championAbilityName[index].innerText = champion.passive.name;

            championAbilityName[index + 1].innerText = spell.name;
            // console.log(spell.id[spell.id.length - 1]);
          });

          populateChampionInfo(originalChampionKey, champion);
        });
    }
  });
}

// VIDEO ERROR FUNCTION
function abilityVideoOnError(video) {
  if (!videoError.className.includes('error-loading-video-toggle'))
    videoError.classList.add('error-loading-video-toggle');

  video.onerror = () => {
    videoError.classList.remove('error-loading-video-toggle');
  };
}

// POPULATING CHAMPION INFO
function populateChampionInfo(key, champion) {
  const lore = document.querySelector('.lore');
  lore.innerText = champion.lore;

  fetch('./championrates.json')
    .then((res) => res.json())
    .then((data) => {
      while (roleImageWrapper.lastChild) {
        roleImageWrapper.removeChild(roleImageWrapper.lastChild);
      }
      while (typeImageWrapper.lastChild) {
        typeImageWrapper.removeChild(typeImageWrapper.lastChild);
      }

      // console.log(data.data[key]);
      const lanes = Object.keys(data.data[key]);
      const pLanes = [];
      lanes.forEach((lane) => {
        if (data.data[key][lane].playRate > 0) {
          pLanes.push(lane[0] + lane.slice(1).toLowerCase());

          const roleImg = document.createElement('img');
          roleImg.setAttribute(
            'src',
            `./assets/champion-roles/${lane.toLowerCase()}.png`
          );

          roleImageWrapper.appendChild(roleImg);
        }
      });

      champion.tags.forEach((tag) => {
        const typeImg = document.createElement('img');
        typeImg.setAttribute(
          'src',
          `./assets/champion-types/${tag.toLowerCase()}.png`
        );

        typeImageWrapper.appendChild(typeImg);
      });

      // Images

      // Text
      const pLanesText = document.querySelector('#info-roles');
      pLanesText.innerText = pLanes.toString().split(',').join(', ');

      const pTypesText = document.querySelector('#info-types');
      pTypesText.innerText = champion.tags.toString().split(',').join(', ');
    });
}

function removeBetweenSymbols(str) {
  let result = '';
  let insideSymbols = false;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === '<') {
      insideSymbols = true;
    } else if (str[i] === '>') {
      insideSymbols = false;
    } else if (!insideSymbols) {
      result += str[i];
    }
  }

  return result;
}

// --- EVENTS
document.addEventListener('DOMContentLoaded', loadAllChampions);

document.addEventListener('DOMContentLoaded', championParameterFilter);

searchBarInput.addEventListener('input', championSearch);

resetButton.addEventListener('click', () => {
  championParameters.forEach((param) => {
    param.classList.remove('active');
  });

  while (output.lastChild) {
    output.removeChild(output.lastChild);
  }

  loadAllChampions();

  params.classList.add('hidden');
  while (params.lastChild) {
    params.removeChild(params.lastChild);
  }
});

params.addEventListener('click', (e) => {
  if (e.target.className.includes('champion-parameter')) {
    const id = e.target.innerText.toLowerCase();
    const desiredBtn = document.querySelector(`#${id}`);
    desiredBtn.click();
  }
});

xMark.addEventListener('click', () => {
  championInfoSection.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', openAndPopulateChampionInfo);

// CHAMPION ABILITY LISTENER
championAbilityImg.forEach((abil, idx) => {
  abil.addEventListener('click', () => {
    championAbilityImg.forEach((a) => {
      a.classList.remove('active-ability');
    });
    abil.classList.add('active-ability');

    abilityVideoOnError(abilityVideo);

    const abilityName = championAbilityName[idx].innerText;
    const abilityType = document.querySelector('p.ability-type');

    videoAbilityName.innerText = abilityName;

    const champion = document.querySelector('p#champion-name').dataset.name;

    fetch(
      `https://ddragon.leagueoflegends.com/cdn/13.7.1/data/en_US/champion/${champion}.json`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data.data[champion]);
        // data.data[champion].
        console.log(data.data[champion].passive.description);

        let champKey = data.data[champion].key;
        while (champKey.length < 4) {
          champKey = '0' + champKey;
        }

        console.log(champKey);

        if (idx === 0) {
          videoAbilityDescription.innerText =
            data.data[champion].passive.description;
        } else {
          videoAbilityDescription.innerText =
            data.data[champion].spells[idx - 1].description;
        }

        switch (idx) {
          case 0:
            abilityType.innerText = 'PASSIVE';
            abilityVideo.setAttribute(
              'src',
              `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${champKey}/ability_${champKey}_P1.webm`
            );

            break;
          case 1:
            abilityType.innerText = 'Q';
            abilityVideo.setAttribute(
              'src',
              `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${champKey}/ability_${champKey}_Q1.webm`
            );
            break;
          case 2:
            abilityType.innerText = 'W';
            abilityVideo.setAttribute(
              'src',
              `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${champKey}/ability_${champKey}_W1.webm`
            );
            break;
          case 3:
            abilityType.innerText = 'E';
            abilityVideo.setAttribute(
              'src',
              `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${champKey}/ability_${champKey}_E1.webm`
            );
            break;
          case 4:
            abilityType.innerText = 'R';
            abilityVideo.setAttribute(
              'src',
              `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${champKey}/ability_${champKey}_R1.webm`
            );
            break;
        }
      });
  });
});
