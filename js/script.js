// --- VARIABLES ------------------------------------------------------------------------------------------
// HEADER
const infoButton = document.querySelector('.fa-info');
const infoHelp = document.querySelector('.info-help');
const infoDivXMark = document.querySelector('.info-help-text-area .fa-xmark');
const modal = document.querySelector('dialog');

// MAIN SECTION
const output = document.getElementById('card-output');
const supportButton = document.querySelector('.support');
const searchBar = document.querySelector('.search-bar');
const searchBarInput = document.querySelector('.search-bar input');
const championAmount = document.querySelector('.champion-amount');

// GLOBAL VARIABLES TO CONNECT SEARCH BAR WITH OTHER FILTERS
let searchTerm = searchBarInput.value;
let currentNames = [];

// CHAMPION PARAMETERS
const championParameters = document.querySelectorAll('.search-bar > div > div');
const params = document.querySelector('.parameters');
const resetButton = document.querySelector('.reset');

// CHAMPION INFO SECTION
const championInfoSection = document.querySelector('#champion-info');
const xMark = document.querySelector('#champion-info .fa-xmark');
const championName = document.querySelector('#champion-name');
const championInfoWrapper = document.querySelector('.info');
const championAbilitiesWrapper = document.querySelector('.abilities');
const typeImageWrapper = document.querySelector('.info-type-images');
const roleImageWrapper = document.querySelector('.info-role-images');
const championAbilityImg = document.querySelectorAll('.ability img');
const championAbilityName = document.querySelectorAll(
  '.ability p:nth-child(2)'
);

// ABILITY VIDEO
const tempVideo = document.createElement('video');
const abilityVideoDiv = document.querySelector(
  '.champion-ability-preview-video'
);
const abilityVideo = document.querySelector('.champion-ability-preview video');
const videoAbilityType = document.querySelector('p.ability-type');
const videoAbilityName = document.querySelector('p.ability-name');
const videoAbilityDescription = document.querySelector('p.ability-description');
const videoError = document.querySelector('.error-loading-video');

// DIFFICULTY
const diff1 = document.querySelector('#diff-1');
const diff2 = document.querySelector('#diff-2');
const diff3 = document.querySelector('#diff-3');

// CHAMPION ENDPOINT
const CHAMPION_ENDPOINT = `https://ddragon.leagueoflegends.com/cdn/13.7.1/data/en_US/champion.json`;

// --- FUNCTIONS ------------------------------------------------------------------------------------------
// TOGGLE HELP
function infoShowModal() {
  modal.showModal();
  opacityAnimation(modal, 0.3);
  document.body.style.overflow = 'hidden';
}

function infoCloseModal() {
  modal.close();
  modal.style.animation = 'fadeOut 0.75s';
  document.body.style.overflow = 'initial';
}

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
      if (nameCount === 1) {
        championAmount.innerText = nameCount.toString() + ' Champion';
      } else {
        championAmount.innerText = nameCount.toString() + ' Champions';
      }
      // --------------------------------------------------------------
      openAndPopulateChampionInfo(data);
    });

  // SETTING CURRENT NAMES TO INCLUDE ALL 163 LOADED CHAMPIONS
  currentNames = allChampions;
}

// GENERATING CHAMPION CARDS (INSIDE loadAllChampions() FUNCTION)
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

  championImage.setAttribute('loading', 'lazy');
  championImage.style.opacity = '0';
  championImage.addEventListener('load', () => {
    championImage.style.opacity = '1';
  });

  championName.innerText = `${name}`;
  fullChampionName.innerText = `${champFullName}`;

  card.append(championImage, championName, fullChampionName, cardImgOverlay);

  output.append(card);
}

// PARAMETER FILTERS
function championParameterFilter() {
  championParameters.forEach((param) => {
    param.addEventListener('click', (e) => {
      const searchedNames = [];
      const allCardNames = [];

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
          if (
            parameter.innerText
              .toLowerCase()
              .includes(e.target.id.toLowerCase())
          ) {
            parameter.parentNode.removeChild(parameter);
          }
        });
      }

      let emptyArr = [];
      let emptyNames = [];
      let activeCheck = false;

      championParameters.forEach(async (param) => {
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

          await fetch(CHAMPION_ENDPOINT)
            .then((res) => res.json())
            .then(async (data) => {
              let emptyObj = {};
              const sortedData = {};
              const keyArray = [];
              const championNames = Object.keys(data.data);

              championNames.forEach((name) => {
                emptyObj[name] = data.data[name].key;
                keyArray.push(data.data[name].key);
              });

              // -----2ND FETCH-------------------------------------------------------
              await fetch('./data/championrates.json')
                .then((res) => res.json())
                .then((data2) => {
                  keyArray.forEach((el) => {
                    sortedData[`a${el}`] = data2.data[el];
                  });

                  data2.data = sortedData;
                  const champKeys = Object.keys(data2.data);
                  console.log(champKeys);
                  champKeys.forEach((key) => {
                    newKey = key.substring(1);

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
                            searchedNames.push(champion);
                          }
                        }
                      }
                    }
                  });

                  const allCards = document.querySelectorAll('.champion-card');
                  allCards.forEach((card) => {
                    allCardNames.push(card.childNodes[1].innerText);
                  });

                  if (allCards.length === 1) {
                    championAmount.innerText = allCards.length + ' Champion';
                  } else {
                    championAmount.innerText = allCards.length + ' Champions';
                  }

                  // SETTING CURRENT NAMES TO CONTAIN ALL NAMES APPLICABLE TO THE FILTERS SET
                  currentNames = emptyNames;

                  // ALL CHAMPIONS THAT ARE BEING SEARCHED (CLASSLIST 'HIDDEN' IS REMOVED)
                  searchedNames.forEach((name) => {
                    allCards.forEach((card) => {
                      if (card.childNodes[1].innerText === name) {
                        card.classList.remove('hidden');
                      }
                    });
                  });

                  // ALL CHAMPIONS THAT ARE NOT BEING SEARCHED (CLASSLIST 'HIDDEN IS ADDED)
                  const intersection = allCardNames.filter(
                    (el) => !searchedNames.includes(el)
                  );

                  intersection.forEach((champion) => {
                    allCards.forEach((card) => {
                      if (card.childNodes[1].innerText === champion) {
                        card.classList.add('hidden');
                      }
                    });
                  });

                  if (searchedNames.length === 1) {
                    championAmount.innerText =
                      searchedNames.length + ' Champion';
                  } else {
                    championAmount.innerText =
                      searchedNames.length + ' Champions';
                  }
                });
              // ---------------------------------------------------------------------
            });
        }
      });

      if (activeCheck === false) {
        params.classList.add('hidden');

        const allCards = document.querySelectorAll('.champion-card');
        currentNames = [];
        let cardLength = 0;

        allCards.forEach((card) => {
          currentNames.push(card.childNodes[1].innerText);

          if (
            card.childNodes[1].innerText
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          ) {
            cardLength++;
            if (card.className.includes('hidden')) {
              card.classList.remove('hidden');
            }
          }
        });

        if (cardLength === 1) {
          championAmount.innerText = cardLength + ' Champion';
        } else {
          championAmount.innerText = cardLength + ' Champions';
        }
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

  fetch(CHAMPION_ENDPOINT)
    .then((res) => res.json())
    .then((data) => {
      const championNames = Object.keys(data.data);

      const searchedNames = [];
      const allCardNames = [];
      const allCards = document.querySelectorAll('.champion-card');
      allCards.forEach((card) => {
        allCardNames.push(card.childNodes[1].innerText);
      });

      championNames.forEach((name) => {
        if (name.toLowerCase().includes(searchBarInput.value.toLowerCase())) {
          currentNames.forEach((currentName) => {
            if (currentName === name) {
              // PUSHING EACH CHAMPION NAME INTO THE searchedNames array IF IT MATCHES ALL CRITERIAS
              searchedNames.push(name);
            }
          });
        }
      });

      // ALL CHAMPIONS THAT ARE BEING SEARCHED (CLASSLIST 'HIDDEN' IS REMOVED)
      searchedNames.forEach((name) => {
        allCards.forEach((card) => {
          if (card.childNodes[1].innerText === name) {
            card.classList.remove('hidden');
          }
        });
      });

      // ALL CHAMPIONS THAT ARE NOT BEING SEARCHED (CLASSLIST 'HIDDEN IS ADDED)
      const intersection = allCardNames.filter(
        (el) => !searchedNames.includes(el)
      );

      intersection.forEach((champion) => {
        allCards.forEach((card) => {
          if (card.childNodes[1].innerText === champion) {
            card.classList.add('hidden');
          }
        });
      });

      if (searchedNames.length === 1) {
        championAmount.innerText = searchedNames.length + ' Champion';
      } else {
        championAmount.innerText = searchedNames.length + ' Champions';
      }
    });
}

// GENERATE PARAMETER
function generateParams(target, locationToDisplay) {
  const paramDiv = document.createElement('div');
  const paramDivText = document.createElement('p');
  paramDiv.appendChild(paramDivText);
  paramDiv.classList.add('champion-parameter');
  paramDivText.innerText = target.id.toUpperCase();
  locationToDisplay.appendChild(paramDiv);
}

// CHAMPION INFO SECTION FUNCTION (called inside loadAllChampions(), that's where it gets the fetchedData from)
function openAndPopulateChampionInfo(fetchedData) {
  output.addEventListener('click', (e) => {
    if (e.target.parentNode.className.includes('champion-card')) {
      championInfoSection.style.display = 'grid';
      const cardText = e.target.parentNode.childNodes[1].innerText;
      const cardActualName = e.target.parentNode.childNodes[2].innerText;
      championName.innerText = cardActualName.toUpperCase();
      championName.dataset.name = cardText;

      const loreButton = document.querySelector('#see-more');
      loreButton.classList.remove('hidden');

      // setting champion title
      const fetchedTitle = fetchedData.data[cardText].title;
      const championTitle = document.createElement('span');
      championTitle.id = 'champion-title';
      championTitle.innerText = fetchedTitle.toUpperCase();
      championName.appendChild(championTitle);

      // setting champion difficulty
      const diff = fetchedData.data[cardText].info.difficulty;
      difficulty(diff);

      // setting the rest of champion info
      populateChampionInfo(
        fetchedData.data[cardText].key,
        fetchedData.data[cardText]
      );

      fetch(
        `https://ddragon.leagueoflegends.com/cdn/13.7.1/data/en_US/champion/${cardText}.json`
      )
        .then((res) => res.json())
        .then((data) => {
          const champion = data.data[cardText];

          // changing from champion blurb to lore
          const loreText = document.querySelector('p.lore');

          loreButton.addEventListener('click', () => {
            loreButton.classList.add('hidden');
            loreText.innerText = champion.lore;
          });

          // video
          // const originalChampionKey = champion.key;
          let championKey = champion.key;
          const abilityType = document.querySelector('.ability-type');
          const abilityDescription = document.querySelector(
            '.ability-description'
          );

          // DEFAULT VIDEO VALUES
          // -- default names
          // animating ability type, name and description after each ability is clicked

          opacityAnimation(videoAbilityType);
          opacityAnimation(videoAbilityName);
          opacityAnimation(videoAbilityDescription);

          abilityDescription.innerText = removeBetweenSymbols(
            champion.passive.description
          );
          videoAbilityName.innerText = champion.passive.name;
          abilityType.innerText = 'PASSIVE';
          championAbilityImg.forEach((abil) =>
            abil.classList.remove('active-ability')
          );

          championAbilityImg[0].classList.add('active-ability');

          if (championKey.length === 2) championKey = `0${championKey}`;
          else if (championKey.length === 1) championKey = `00${championKey}`;

          // -- default video
          tempVideo.setAttribute(
            'src',
            `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/0${championKey}/ability_0${championKey}_P1.webm`
          );

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
          });

        });
    }
  });
  championAbilityImg.forEach((img) => {
    img.addEventListener('load', () => {
      img.style.opacity = '1';
      opacityAnimation(img);
    });
  });
}

// VIDEO ERROR FUNCTION (WORKS INSIDE openAndPopulateChampionInfo() FUNCTION)
function abilityVideoOnError(video) {
  if (!videoError.className.includes('error-loading-video-toggle'))
    videoError.classList.add('error-loading-video-toggle');

  video.onerror = () => {
    videoError.classList.remove('error-loading-video-toggle');
  };
}

// POPULATING CHAMPION INFO (WORKS INSIDE openAndPopulateChampionInfo() FUNCTION)
function populateChampionInfo(key, champion) {
  const lore = document.querySelector('.lore');
  lore.innerText = champion.blurb;

  fetch('./data/championrates.json')
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

      // Champion Mastery
      const uGG = document.getElementById('u.gg');
      uGG.setAttribute(
        'href',
        `https://u.gg/lol/champions/${champion.id}/build`
      );
      uGG.setAttribute('target', '_blank');

      const probuilds = document.getElementById('probuilds');
      probuilds.setAttribute(
        'href',
        `https://www.probuilds.net/champions/details/${champion.id}`
      );

      probuilds.setAttribute('target', '_blank');
    });
}

// INNER HTML REMOVAL FROM DESCRIPTION STRING (WORKS INSIDE openAndPopulateChampionInfo() FUNCTION)
function removeBetweenSymbols(str) {
  let result = '';
  let insideSymbols = false;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === '<') {
      insideSymbols = true;
    } else if (str[i] === '>') {
      insideSymbols = false;
    } else if (insideSymbols && str[i] === 'b' && str[i + 1] === 'r') {
      result += '\n';
    } else if (!insideSymbols) {
      result += str[i];
    }
  }

  return result;
}

// TRIGGER CHANGE FUNCTION (WORKS INSIDE resetButton EVENT FUNCTION)
function triggerChange(element) {
  let changeEvent = new Event('input');
  element.dispatchEvent(changeEvent);
}

// ANIMATING ABILITIES AFTER EACH ABILTY IS CLICKED (USED WITHIN championAbilityImg.forEach CLICK EVENT LISTENER)
function opacityAnimation(abilityElement, speed = 0.75) {
  abilityElement.style.animation = `opacityAnimation ${speed.toString()}s`;

  abilityElement.addEventListener('animationend', () => {
    abilityElement.style.animation = 'none';
  });
}

// --- EVENTS ------------------------------------------------------------------------------------------
// INFO HELP BUTTONS
infoButton.addEventListener('click', infoShowModal);
infoDivXMark.addEventListener('click', infoCloseModal);

// LOADING ALL CHAMPIONS ON LOAD
document.addEventListener('DOMContentLoaded', loadAllChampions);

// CHAMPION PARAMETER FILTER ON LOAD
document.addEventListener('DOMContentLoaded', championParameterFilter);

// SEARCHBAR INPUT LISTENER
searchBarInput.addEventListener('input', championSearch);

// RESET BUTTON
resetButton.addEventListener('click', () => {
  searchBarInput.value = '';
  triggerChange(searchBarInput);

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

// CHAMPION PARAMETER REDIRECT
params.addEventListener('click', (e) => {
  if (e.target.parentNode.className.includes('champion-parameter')) {
    const id = e.target.innerText.toLowerCase();
    const desiredBtn = document.querySelector(`#${id}`);
    desiredBtn.click();
  }
});

// X MARK INSIDE CHAMPION INFO (TO CLOSE)
xMark.addEventListener('click', () => {
  championInfoSection.style.animation = 'championInfoClose 0.75s';
});

// CLOSING CHAMPION INFO SECTION AND RESETTING ANIMATION
championInfoSection.addEventListener('animationend', () => {
  if (championInfoSection.style.animation.includes('championInfoClose')) {
    championInfoSection.style.display = 'none';
    championInfoSection.style.animation = 'maxHeight 0.75s';
  }
});

// CHAMPION ABILITIES CLICK EVENT LISTENER
championAbilityImg.forEach((abil, idx) => {
  abil.addEventListener('click', async () => {
    // animating ability type, name and description after each ability is clicked
    opacityAnimation(videoAbilityType);
    opacityAnimation(videoAbilityName);
    opacityAnimation(videoAbilityDescription);

    championAbilityImg.forEach((a) => {
      a.classList.remove('active-ability');
    });
    abil.classList.add('active-ability');

    abilityVideoOnError(abilityVideo);

    const abilityName = championAbilityName[idx].innerText;

    videoAbilityName.innerText = abilityName;

    const champion = document.querySelector('p#champion-name').dataset.name;

    await fetch(
      `https://ddragon.leagueoflegends.com/cdn/13.7.1/data/en_US/champion/${champion}.json`
    )
      .then((res) => res.json())
      .then((data) => {
        let champKey = data.data[champion].key;
        while (champKey.length < 4) {
          champKey = '0' + champKey;
        }

        if (idx === 0) {
          videoAbilityDescription.innerText = removeBetweenSymbols(
            data.data[champion].passive.description
          );
        } else {
          videoAbilityDescription.innerText = removeBetweenSymbols(
            data.data[champion].spells[idx - 1].description
          );
        }

        switch (idx) {
          case 0:
            videoAbilityType.innerText = 'PASSIVE';
            abilityVideo.pause();
            tempVideo.setAttribute(
              'src',
              `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${champKey}/ability_${champKey}_P1.webm`
            );
            break;
          case 1:
            videoAbilityType.innerText = 'Q';
            abilityVideo.pause();
            tempVideo.setAttribute(
              'src',
              `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${champKey}/ability_${champKey}_Q1.webm`
            );
            break;
          case 2:
            videoAbilityType.innerText = 'W';
            abilityVideo.pause();
            tempVideo.setAttribute(
              'src',
              `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${champKey}/ability_${champKey}_W1.webm`
            );
            break;
          case 3:
            videoAbilityType.innerText = 'E';
            abilityVideo.pause();
            tempVideo.setAttribute(
              'src',
              `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${champKey}/ability_${champKey}_E1.webm`
            );
            break;
          case 4:
            videoAbilityType.innerText = 'R';
            abilityVideo.pause();
            tempVideo.setAttribute(
              'src',
              `https://d28xe8vt774jo5.cloudfront.net/champion-abilities/${champKey}/ability_${champKey}_R1.webm`
            );
            break;
        }
      });
  });
});

// SETTING ABILITY VIDEO SOURCE ONLY AFTER THE SOURCE IS LOADED
tempVideo.addEventListener('loadeddata', () => {
  abilityVideo.setAttribute('src', `${tempVideo.src}`);
  abilityVideo.play();
});
