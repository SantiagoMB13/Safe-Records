import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0';
import { fakerES as faker } from "https://esm.sh/@faker-js/faker@v8.4.0";

// Cargamos el modelo desde Hugging Face
env.allowLocalModels = false;
const pipe = await pipeline('token-classification', 'Xenova/bert-base-multilingual-cased-ner-hrl');

// Selecciona el botón por su ID
const boton = document.getElementById('runmodelbtn');

// Evento para el botón de ejecutar modelo
document.getElementById('runmodelbtn').addEventListener('click', async () => {
    const inputText = document.getElementById('input-text').value;
    const mode = document.getElementById('anonimization-mode').value;
    if (inputText) {
        await runNER(inputText, mode);
    } else {
        alert('Por favor, ingrese algún texto.');
    }
});

// Evento para el botón de subir archivo
document.getElementById('uploadfilebtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    const mode = document.getElementById('anonimization-mode').value;
    if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const inputText = e.target.result;
            await runNER(inputText, mode);
        };
        reader.readAsText(file);
    } else {
        alert('Por favor, suba un archivo.');
    }
});

// Evento para el botón de limpiar resultados
document.getElementById('clearResultsBtn').addEventListener('click', () => {
    document.getElementById('result').innerHTML = '';
    document.getElementById('input-text').value = '';
    document.getElementById('file-input').value = '';
});

// Función para ejecutar el modelo NER
async function runNER(inputText, mode) {
    const resultDiv = document.getElementById('result');

    if (!inputText) {
        resultDiv.textContent = 'Por favor, ingrese algún texto.';
        return;
    }

    resultDiv.textContent = 'Analizando...';

    try {
        const segments = splitText(inputText);
        let cleanedEntities = [];
        let replacedText = '';
        for (const segment of segments) {
            const entities = await pipe(segment);
            const cleanedSegmentEntities = cleanEntities(entities);
            const filteredEntities = filterEntities(cleanedSegmentEntities);
            cleanedEntities = cleanedEntities.concat(filteredEntities);
            replacedText += " " + replaceEntities(segment, filteredEntities, mode) + " ";
        }
        replacedText = replacedText.slice(0, -1);
        replacedText = secondaryReplacements(replacedText, mode);
        displayResults(replacedText, cleanedEntities);
    } catch (error) {
        resultDiv.textContent = 'Error al procesar el texto: ' + error.message;
    }
}

// Función para separar el texto por saltos de línea
function splitText(text) {
    const lines = text.split('\n');
    const segments = [];
    for (let i = 0; i < lines.length; i++) {
        const segment = lines[i].trim();
        if (segment) {
            segments.push(segment);
        }
    }
    return segments;
}

// Función para limpiar las entidades y combinar las que tengan un índice consecutivo para formar una sola entidad.
function cleanEntities(entities) {
    const cleanedEntities = [];
    let currentEntity = null;

    entities.forEach((entity, index) => {
        if (currentEntity && entity.index === currentEntity.index + 1) {
            if (entity.word.startsWith('##')) {
                currentEntity.word += entity.word.replace('##', '');
            } else {
                currentEntity.word += ' ' + entity.word;
            }
            currentEntity.index = entity.index;
        } else {
            if (currentEntity) {
                cleanedEntities.push(currentEntity);
            }
            currentEntity = { ...entity };
        }
    });

    if (currentEntity) {
        cleanedEntities.push(currentEntity);
    }

    return cleanedEntities;
}

// Función para filtrar las entidades con una puntuación menor a 0.6
function filterEntities(entities) {
    return entities.filter(entity => entity.score >= 0.6);
}

// Función para reemplazar las entidades en el texto
function replaceEntities(text, entities, mode) {
    let replacedText = text;

    entities.forEach(entity => {
        let replacement;

        // Se reemplazan las entidades de persona, lugar y organización con datos falsos según el modo seleccionado
        if (mode === 'advanced') {
            if (entity.entity.includes('PER')) {
                replacement = faker.person.firstName() + ' ' + faker.person.lastName();
            } else if (entity.entity.includes('LOC')) {
                if (/\d/.test(entity.word)) { // Si la entidad LOC contiene un número, se asume que es una dirección
                    replacement = faker.location.streetAddress(true);
                } else {
                    replacement = faker.location.country();
                }
            } else if (entity.entity.includes('ORG')) {
                replacement = faker.company.name();
            } else {
                replacement = entity.entity;
            }
        } else if (mode === 'generic') {
            if (entity.entity.includes('PER')) {
                replacement = '[persona]';
            } else if (entity.entity.includes('LOC')) {
                if (/\d/.test(entity.word)) {
                    replacement = '[dirección]';
                } else {
                    replacement = '[lugar]';
                }
            } else if (entity.entity.includes('ORG')) {
                replacement = '[organización]';
            } else {
                replacement = entity.entity;
            }
        }

        const regex = new RegExp(`\\b${entity.word}\\b`, 'g'); // Se reemplaza la entidad solo si es una palabra completa
        replacedText = replacedText.replace(regex, replacement);
    });

    return replacedText;
}

// Función para reemplazar entidades secundarias como correos electrónicos, números de teléfono, cédulas y fechas mediante RegEx
function secondaryReplacements(text, mode) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(?<!\d)(\d\s*\.?\s*){10}(?=\s|\.|\n|$)/g;
    const idRegex = /(\d\s*\.?\s*){5,}/g;
    const dateRegex = /\b\d{2}[-/]\d{2}[-/]\d{4}\b/g; // Se puede separar en 2 para los formatos dd/mm/yyyy y dd-mm-yyyy
    //Ahora mismo se consideran formatos incorrectos como dd-mm/yyyy o dd/mm-yyyy, pero por ahora no se considera un problema al ser un caso demasiado específico
    
    let emailReplacement, phoneReplacement, idReplacement, dateReplacement;
    
    if (mode === 'advanced') {
        emailReplacement = faker.internet.email();
        phoneReplacement = faker.helpers.fromRegExp('[0-9]{10}');
        idReplacement = faker.string.numeric({ length: { min: 5, max: 12 }, allowLeadingZeros: false });
        dateReplacement = faker.number.int({ min: 1, max: 31 }) + '/' + faker.number.int({ min: 1, max: 12 }) + '/' + faker.number.int({ min: 1900, max: 2024 });
    } else {
        emailReplacement = '[email]';
        phoneReplacement = '[celular]'; 
        idReplacement = '[id]';
        dateReplacement = '[fecha]';
    }
    
    text = text.replace(emailRegex, emailReplacement);
    text = text.replace(phoneRegex, phoneReplacement); 
    text = text.replace(idRegex, idReplacement);
    text = text.replace(dateRegex, dateReplacement);
    
    return text;
}

// Función para mostrar los resultados en la página
function displayResults(replacedText, entities) {
    const resultDiv = document.getElementById('result');

    let output = `<h2>Texto anonimizado</h2><p>${replacedText}</p>`;
    output += '<h2>Resultados del modelo</h2><ul>';

    entities.forEach(entity => {
        output += `<li><strong>Texto:</strong> ${entity.word}<br>`;
        output += `<strong>Tipo:</strong> ${entity.entity}<br>`;
        output += `<strong>Puntuación:</strong> ${entity.score.toFixed(4)}</li>`;
    });

    output += '</ul>';
    output += '<button id="downloadButton" class="btn btn-primary">Descargar Texto Anonimizado</button>';

    resultDiv.innerHTML = output;

    document.getElementById('downloadButton').addEventListener('click', function() {
        const blob = new Blob([replacedText], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'nota_anonimizada.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}
