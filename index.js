function vigenereEncrypt(text, key, extended = false) {
    let result = "";
    let keyIndex = 0;
    
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (!extended && !char.match(/[a-zA-Z]/)) continue;
        
        let charCode = extended ? text.charCodeAt(i) : text.toUpperCase().charCodeAt(i) - 65;
        let keyChar = key[keyIndex % key.length];
        let keyCode = extended ? keyChar.charCodeAt(0) : keyChar.toUpperCase().charCodeAt(0) - 65;
        
        if (extended) {
            result += String.fromCharCode((charCode + keyCode) % 256);
        } else {
            result += String.fromCharCode(((charCode + keyCode) % 26) + 65);
        }
        keyIndex++;
    }
    
    return result;
}

function vigenereDecrypt(text, key, extended = false) {
    let result = "";
    let keyIndex = 0;
    
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (!extended && !char.match(/[a-zA-Z]/)) continue;
        
        let charCode = extended ? text.charCodeAt(i) : text.toUpperCase().charCodeAt(i) - 65;
        let keyChar = key[keyIndex % key.length];
        let keyCode = extended ? keyChar.charCodeAt(0) : keyChar.toUpperCase().charCodeAt(0) - 65;
        
        if (extended) {
            result += String.fromCharCode((charCode - keyCode + 256) % 256);
        } else {
            result += String.fromCharCode(((charCode - keyCode + 26) % 26) + 65);
        }
        keyIndex++;
    }
    
    return result;
}

// Playfair Cipher implementation
function generatePlayfairMatrix(key) {
    let matrix = [];
    let alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // Note: I and J are combined
    let usedChars = new Set();
    
    // First, add the key to the matrix
    for (let char of key.toUpperCase()) {
        if (char === 'J') char = 'I';
        if (!usedChars.has(char) && char.match(/[A-Z]/)) {
            matrix.push(char);
            usedChars.add(char);
        }
    }
    
    // Then add the remaining alphabet
    for (let char of alphabet) {
        if (!usedChars.has(char)) {
            matrix.push(char);
            usedChars.add(char);
        }
    }
    
    return matrix;
}

function playfairEncrypt(text, key) {
    const matrix = generatePlayfairMatrix(key);
    text = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    
    // Prepare the text (split into digraphs)
    let pairs = [];
    for (let i = 0; i < text.length; i += 2) {
        let pair = text[i];
        pair += (i + 1 < text.length) ? text[i + 1] : 'X';
        if (pair[0] === pair[1]) pair = pair[0] + 'X';
        pairs.push(pair);
    }
    
    // Encrypt each digraph
    let result = "";
    for (let pair of pairs) {
        let pos1 = matrix.indexOf(pair[0]);
        let pos2 = matrix.indexOf(pair[1]);
        let row1 = Math.floor(pos1 / 5), col1 = pos1 % 5;
        let row2 = Math.floor(pos2 / 5), col2 = pos2 % 5;
        
        if (row1 === row2) {
            result += matrix[row1 * 5 + (col1 + 1) % 5];
            result += matrix[row2 * 5 + (col2 + 1) % 5];
        } else if (col1 === col2) {
            result += matrix[((row1 + 1) % 5) * 5 + col1];
            result += matrix[((row2 + 1) % 5) * 5 + col2];
        } else {
            result += matrix[row1 * 5 + col2];
            result += matrix[row2 * 5 + col1];
        }
    }
    
    return result;
}

// Enigma Cipher (Simplified) implementation
class EnigmaMachine {
    constructor() {
        this.rotors = [
            'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
            'AJDKSIRUXBLHWTMCQGZNPYFVOE',
            'BDFHJLCPRTXVZNYEIWGAKMUSQO'
        ];
        this.reflector = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';
        this.rotorPositions = [0, 0, 0];
    }

    rotateRotor(rotor) {
        return rotor.slice(1) + rotor[0];
    }

    encryptLetter(letter) {
        for (let i = 0; i < 3; i++) {
            const index = letter.charCodeAt(0) - 65;
            letter = this.rotors[i][index];
        }

        const index = letter.charCodeAt(0) - 65;
        letter = this.reflector[index];

        for (let i = 2; i >= 0; i--) {
            const index = this.rotors[i].indexOf(letter);
            letter = String.fromCharCode(65 + index);
        }

        this.rotors[0] = this.rotateRotor(this.rotors[0]);

        return letter;
    }

    encrypt(text) {
        return text.toUpperCase().split('').map(char => {
            if (/[A-Z]/.test(char)) {
                return this.encryptLetter(char);
            }
            return char;
        }).join('');
    }
}

// One-Time Pad Cipher implementation
function otpEncrypt(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        let charCode = text.charCodeAt(i);
        let keyCode = key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode ^ keyCode);
    }
    return result;
}

function otpDecrypt(text, key) {
    return otpEncrypt(text, key);
}

// UI-related functions
function displayOutput(result) {
    document.getElementById('outputText').textContent = result;
}

function encrypt() {
    const text = document.getElementById('inputText').value;
    const key = document.getElementById('key').value;
    const cipherType = document.getElementById('cipherType').value;
    let result = '';

    switch (cipherType) {
        case 'vigenere':
            result = vigenereEncrypt(text, key);
            break;
        case 'extendedVigenere':
            result = vigenereEncrypt(text, key, true);
            break;
        case 'playfair':
            result = playfairEncrypt(text, key);
            break;
        case 'enigma':
            const enigma = new EnigmaMachine();
            result = enigma.encrypt(text);
            break;
        case 'otp':
            result = otpEncrypt(text, key);
            break;
        default:
            result = 'Invalid cipher selected!';
    }

    displayOutput(result);
}

function decrypt() {
    const text = document.getElementById('inputText').value;
    const key = document.getElementById('key').value;
    const cipherType = document.getElementById('cipherType').value;
    let result = '';

    switch (cipherType) {
        case 'vigenere':
            result = vigenereDecrypt(text, key);
            break;
        case 'extendedVigenere':
            result = vigenereDecrypt(text, key, true);
            break;
        case 'playfair':
            // Decryption logic for Playfair (can be added here)
            break;
        case 'enigma':
            const enigma = new EnigmaMachine();
            result = enigma.encrypt(text); // Enigma is symmetric
            break;
        case 'otp':
            result = otpDecrypt(text, key);
            break;
        default:
            result = 'Invalid cipher selected!';
    }

    displayOutput(result);
}

// File upload handling
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('inputText').value = e.target.result;
    };
    reader.readAsText(file);
});

// Download output as file
function downloadOutput() {
    const text = document.getElementById('outputText').textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'output.txt';
    anchor.click();
}