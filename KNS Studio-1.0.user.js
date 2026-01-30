// ==UserScript==
// @name         KNS Studio
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Инструментарий творца
// @author       Ид / 1667906
// @match        http*://*.catwar.su/cw3/kns
// @match        http*://*.catwar.net/cw3/kns
// @license      MIT
// @iconURL      https://raw.githubusercontent.com/iramorktum/warchik/refs/heads/main/103456.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const furColors = [
        "#f5e5ce", "#ffffff", "#e6e6e6", "#d1d1d1", "#9e9e9e", "#5c5c5c",
        "#242424", "#141414", "#1d212c", "#2b1d1c", "#3d1c0b", "#6b3c28",
        "#9a715f", "#bd6d32", "#cb4402", "#e15c0f", "#ed9b2d", "#e5bd7f",
        "#d7ae98", "#b19798", "#a6b4b7", "#697a8a", "#465165", "#323d51"
    ];
    const skinColors = [
        "#f5e5ce", "#ffffff", "#9e9e9e", "#242424", "#3d1c0b", "#6b3c28",
        "#9a715f", "#bd6d32", "#e15c0f", "#cc8370", "#b19798", "#465165"
    ];
    const whiskersColors = ["#ffffff", "#5c5c5c", "#242424"];
    const eyeColors = [
        "#9C7941", "#362121", "#612322", "#D6700B", "#FCB10D", "#FCDF00",
        "#B3B059", "#A8AB0C", "#2FA12D", "#7DC210", "#0ECC90", "#87C3D4",
        "#148CCC", "#192580", "#7D8996", "#734563", "#B90000"
    ];
    let selectedColorCell = null;
    let mainPaletteContainer = null;
    let originalCode = "";
    let colorReplacements = {
        mainColors: {},
        skinColors: {},
        whiskersColor: {},
        eyeColors: {}
    };
    let updateButton = null;
    function createStyle() {
        let style = document.createElement("style");
        style.innerHTML = `.row-color-mode{margin:10px 0;page-break-after:always;display:flex;flex-wrap:wrap;}
        .row-color-mode div{height:30px;width:30px;border-radius:40%;box-sizing:border-box;}
        .all-palettes-container{margin-bottom:30px; margin-top:25px;}
        .palette-container{margin-bottom:10px}
        .main-palette-container{padding-top:20px;}
        #mode .btn-kns{margin:20px 0 0 0;}
        .update-code-btn{margin:30px 0 30px 0 !important;}
        #mode{margin-bottom:30px;}`;
        document.head.appendChild(style);
    }
    function createContainer() {
        let container = document.createElement("div");
        container.id = "mode";
        let header = document.querySelector("h2");
        if (header) {
            header.after(container);
        }
        return container;
    }
    function createButton(container) {
        let button = document.createElement("button");
        button.innerHTML = "Обработать код окраса";
        button.className = "btn-kns";
        button.onclick = () => parseCode();
        container.appendChild(button);
        return button;
    }
    function getColorArray(type) {
        switch(type) {
            case "mainColors": return furColors;
            case "skinColors": return skinColors;
            case "whiskersColor": return whiskersColors;
            case "eyeColors": return eyeColors;
            default: return [];
        }
    }
    function getTypeName(type) {
        switch(type) {
            case "mainColors": return "Основные цвета";
            case "skinColors": return "Уши внутри и нос";
            case "whiskersColor": return "Усы";
            case "eyeColors": return "Цвет глаз";
            default: return type;
        }
    }
    function createMainPalette() {
        if (mainPaletteContainer && mainPaletteContainer.parentNode) {
            mainPaletteContainer.remove();
        }
        mainPaletteContainer = document.createElement("div");
        mainPaletteContainer.className = "main-palette-container";
        let header = document.createElement("h3");
        header.innerHTML = "Выберите цвет из палитры";
        mainPaletteContainer.appendChild(header);
        let paletteRow = document.createElement("div");
        paletteRow.className = "row-color-mode";
        mainPaletteContainer.appendChild(paletteRow);
        return mainPaletteContainer;
    }
    function populateMainPalette(colorsArray) {
        let paletteRow = mainPaletteContainer.querySelector(".row-color-mode");
        paletteRow.innerHTML = "";
        colorsArray.forEach((color, index) => {
            let colorCell = document.createElement("div");
            colorCell.classList.add("colour");
            colorCell.style.backgroundColor = color;
            colorCell.dataset.colorIndex = index;
            colorCell.onclick = () => {
                if (selectedColorCell) {
                    let type = selectedColorCell.classList.contains("mainColors") ? "mainColors" :
                    selectedColorCell.classList.contains("skinColors") ? "skinColors" :
                    selectedColorCell.classList.contains("whiskersColor") ? "whiskersColor" : "eyeColors";
                    let colorsArray = getColorArray(type);
                    let newColorIndex = index;
                    let originalIndex = selectedColorCell.dataset.originalIndex || selectedColorCell.dataset.colorIndex;
                    selectedColorCell.dataset.originalIndex = originalIndex;
                    colorReplacements[type][originalIndex] = newColorIndex;
                    selectedColorCell.style.backgroundColor = colorsArray[newColorIndex];
                    selectedColorCell.dataset.colorIndex = newColorIndex;
                    if (updateButton) {
                        updateButton.style.display = "block";
                    }
                    selectedColorCell.classList.remove("selected_colour");
                    selectedColorCell = null;
                    mainPaletteContainer.style.display = "none";
                }
            };
            paletteRow.appendChild(colorCell);
        });
    }
    function createColorChangePalette(colorCell) {
        let originalIndex = colorCell.dataset.originalIndex || colorCell.dataset.colorIndex;
        colorCell.dataset.originalIndex = originalIndex;
        selectedColorCell = colorCell;
        let type = colorCell.classList.contains("mainColors") ? "mainColors" :
        colorCell.classList.contains("skinColors") ? "skinColors" :
        colorCell.classList.contains("whiskersColor") ? "whiskersColor" : "eyeColors";
        let colorsArray = getColorArray(type);
        if (!mainPaletteContainer) {
            let allPalettesContainer = document.querySelector(".all-palettes-container");
            if (allPalettesContainer) {
                let mainPalette = createMainPalette();
                allPalettesContainer.appendChild(mainPalette);
            }
        } else {
            mainPaletteContainer.style.display = "block";
        }
        populateMainPalette(colorsArray);
    }
    function createPaletteColors(type, values, container) {
        let palette = document.createElement("div");
        palette.className = "row-color-mode";
        container.appendChild(palette);
        let colorsArray = getColorArray(type);
        values.forEach(value => {
            let colorCell = document.createElement("div");
            colorCell.classList.add("colour", type);
            colorCell.style.backgroundColor = colorsArray[value];
            colorCell.dataset.colorIndex = value;
            colorCell.dataset.originalIndex = value;
            colorCell.onclick = () => {
                document.querySelectorAll(".selected_colour").forEach(el => {
                    el.classList.remove("selected_colour");
                });
                colorCell.classList.add("selected_colour");
                createColorChangePalette(colorCell);
            };
            palette.appendChild(colorCell);
        });
    }
    function createColorPalette(colors) {
        let existingContainer = document.querySelector(".all-palettes-container");
        if (existingContainer) {
            existingContainer.remove();
        }
        if (mainPaletteContainer) {
            mainPaletteContainer.remove();
            mainPaletteContainer = null;
        }
        let allPalettesContainer = document.createElement("div");
        allPalettesContainer.className = "all-palettes-container";
        if (button) {
            button.after(allPalettesContainer);
        }
        Object.keys(colors).forEach(type => {
            if (colors[type].length > 0) {
                let paletteContainer = document.createElement("div");
                paletteContainer.className = "palette-container";
                allPalettesContainer.appendChild(paletteContainer);
                let header = document.createElement("h3");
                header.innerHTML = getTypeName(type);
                paletteContainer.appendChild(header);
                createPaletteColors(type, colors[type], paletteContainer);
            }
        });
        if (!updateButton) {
            updateButton = document.createElement("button");
            updateButton.innerHTML = "Сгенерировать обновленный код";
            updateButton.className = "btn-kns update-code-btn";
            updateButton.style.display = "none";
            updateButton.onclick = generateUpdatedCode;
            let parent = document.querySelector(".all-palettes-container");
            parent.after(updateButton);
        } else {
            updateButton.style.display = "none";
            parent.after(updateButton);
        }
    }
    function parseCode() {
        let input = document.querySelector("#code");
        if (!input) return;
        originalCode = input.value.trim();
        colorReplacements = {mainColors:{}, skinColors:{}, whiskersColor:{}, eyeColors:{}};
        if (updateButton) {
            updateButton.style.display = "none";
        }
        let parts = input.value.split(' ');
        let secondLastIndex = parts.length - 2;
        let lastIndex = parts.length - 1;
        let mainColors = new Set();
        let skinColorsSet = new Set();
        let whiskersColorSet = new Set();
        let eyeColorsSet = new Set();
        parts.forEach((part, groupIndex) => {
            let isEyeGroup = (groupIndex === 1 || groupIndex === 19);
            let isSecondLastGroup = (groupIndex === secondLastIndex);
            let isLastGroup = (groupIndex === lastIndex);
            let is8th9thGroup = (groupIndex === 7 || groupIndex === 8);
            let is22ndElement = (groupIndex === 21);
            let elements = part.includes('-') ? part.split('-') : [part];
            elements.forEach((element, elementIndex) => {
                if (isEyeGroup) {
                    let eyeMatch = element.match(/^(\d+)(?:\|(\d+))?$/);
                    if (eyeMatch) {
                        let eyeColorIndex = parseInt(eyeMatch[1], 10) - 1;
                        if (!isNaN(eyeColorIndex) && eyeColorIndex >= 0 && eyeColorIndex < eyeColors.length) {
                            eyeColorsSet.add(eyeColorIndex);
                        }
                    }
                } else {
                    let match = element.match(/(\d+)\/(\d+)(?:\|(\d+))?/);
                    if (match) {
                        let beforeSlash = parseInt(match[1], 10);
                        let afterSlash = parseInt(match[2], 10) - 1;
                        if (isSecondLastGroup) {
                            whiskersColorSet.add(afterSlash);
                        } else if (isLastGroup) {
                            skinColorsSet.add(afterSlash);
                        } else if (is8th9thGroup && beforeSlash === 4) {
                            skinColorsSet.add(afterSlash);
                        } else if (is22ndElement) {
                            whiskersColorSet.add(afterSlash);
                        } else {
                            mainColors.add(afterSlash);
                        }
                    }
                }
            });
        });
        let colors = {
            mainColors: Array.from(mainColors).sort((a, b) => a - b),
            skinColors: Array.from(skinColorsSet).sort((a, b) => a - b),
            whiskersColor: Array.from(whiskersColorSet).sort((a, b) => a - b),
            eyeColors: Array.from(eyeColorsSet).sort((a, b) => a - b)
        };
        createColorPalette(colors);
    }
    function generateUpdatedCode() {
        if (!originalCode) return;
        let parts = originalCode.split(' ');
        let updatedParts = [];
        parts.forEach((part, groupIndex) => {
            let isEyeGroup = (groupIndex === 1 || groupIndex === 19);
            let isSecondLastGroup = (groupIndex === parts.length - 2);
            let isLastGroup = (groupIndex === parts.length - 1);
            let is8th9thGroup = (groupIndex === 7 || groupIndex === 8);
            let is22ndElement = (groupIndex === 21);
            if (isEyeGroup) {
                let elements = part.includes('-') ? part.split('-') : [part];
                let updatedElements = elements.map((element, elementIndex) => {
                    let eyeMatch = element.match(/^(\d+)(?:\|(\d+))?$/);
                    if (eyeMatch) {
                        let eyeColorIndex = parseInt(eyeMatch[1], 10) - 1;
                        let transparency = eyeMatch[2] || '';
                        if (!isNaN(eyeColorIndex) && eyeColorIndex >= 0) {
                            let originalIndex = eyeColorIndex;
                            if (colorReplacements.eyeColors[originalIndex] !== undefined) {
                                eyeColorIndex = colorReplacements.eyeColors[originalIndex];
                            }
                            let result = (eyeColorIndex + 1).toString();
                            if (transparency) {
                                result += '|' + transparency;
                            }
                            return result;
                        }
                    }
                    return element;
                });
                updatedParts.push(updatedElements.join('-'));
            } else if (part.includes('-')) {
                let elements = part.split('-');
                let updatedElements = elements.map(element => {
                    let match = element.match(/^(\d+)\/(\d+)(?:\|(\d+))?$/);
                    if (match) {
                        let beforeSlash = match[1];
                        let afterSlash = parseInt(match[2], 10) - 1;
                        let transparency = match[3] || '';
                        let colorType = 'mainColors';
                        if (isSecondLastGroup) {
                            colorType = 'whiskersColor';
                        } else if (isLastGroup) {
                            colorType = 'skinColors';
                        } else if (is22ndElement) {
                            colorType = 'whiskersColor';
                        } else if (is8th9thGroup) {
                            if (beforeSlash === '4') {
                                colorType = 'skinColors';
                            }
                        }
                        if (colorReplacements[colorType] && colorReplacements[colorType][afterSlash] !== undefined) {
                            afterSlash = colorReplacements[colorType][afterSlash];
                        }
                        let result = `${beforeSlash}/${afterSlash + 1}`;
                        if (transparency) {
                            result += '|' + transparency;
                        }
                        return result;
                    }
                    return element;
                });
                updatedParts.push(updatedElements.join('-'));
            } else {
                let match = part.match(/^(\d+)\/(\d+)(?:\|(\d+))?$/);
                if (match) {
                    let beforeSlash = match[1];
                    let afterSlash = parseInt(match[2], 10) - 1;
                    let transparency = match[3] || '';
                    let colorType = 'mainColors';
                    if (isSecondLastGroup) {
                        colorType = 'whiskersColor';
                    } else if (isLastGroup) {
                        colorType = 'skinColors';
                    } else if (is22ndElement) {
                        colorType = 'whiskersColor';
                    } else if (is8th9thGroup) {
                        if (beforeSlash === '4') {
                            colorType = 'skinColors';
                        }
                    }
                    if (colorReplacements[colorType] && colorReplacements[colorType][afterSlash] !== undefined) {
                        afterSlash = colorReplacements[colorType][afterSlash];
                    }
                    let result = `${beforeSlash}/${afterSlash + 1}`;
                    if (transparency) {
                        result += '|' + transparency;
                    }
                    updatedParts.push(result);
                } else {
                    updatedParts.push(part);
                }
            }
        });
        let updatedCode = updatedParts.join(' ');
        let resultDiv = document.querySelector(".code-result");
        if (resultDiv) {
            resultDiv.remove();
        }
        let newResultDiv = document.createElement("div");
        newResultDiv.className = "code-result";
        newResultDiv.innerHTML = `<h3>Обновленный код:</h3><textarea id="mode-code" style="width:100%;height:100px;margin-bottom:10px;font-family:monospace;background-color:#111111;color:white;border-radius:0.25rem;border:1px solid black;">${updatedCode}</textarea><button style="margin-bottom:30px;" class = "btn-kns" onclick="this.parentElement.querySelector('#mode-code').select();document.execCommand('copy');alert('Код скопирован!')">Копировать код</button>`;
        let allPalettesContainer = document.querySelector(".all-palettes-container");
        if (allPalettesContainer) {
            container.appendChild(newResultDiv);
        }
    }
    createStyle();
    const container = createContainer();
    const button = createButton(container);
})();