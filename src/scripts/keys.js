var KeyInfo = function() {
    this.pressed = 'Unknown';
    this.modifiers = [];

    //Check if a certain set of keys were pressed
    this.is = function(txt) {
        var keys = txt.replace(/ /gi, '').split('+');

        if (keys.length > 1) {
            for (var i = 0; i < keys.length - 1; i++) {
                if (this.modifiers.indexOf(keys[i]) === -1) {
                    return false;
                }
            }
        }

        return this.pressed == keys[keys.length - 1];
    };
};

var Keys = {
    _keys: {
        8: 'Backspace',
        9: 'Tab',
        13: 'Enter',
        16: 'Shift',
        17: 'Ctrl',
        18: 'Alt',
        20: 'Caps',
        27: 'Esc',
        32: 'Space',
        33: 'PageUp',
        34: 'PageDown',
        35: 'End',
        36: 'Home',
        37: 'Left',
        38: 'Up',
        39: 'Right',
        40: 'Down',
        45: 'Insert',
        46: 'Delete',
        65: 'A',
        66: 'B',
        67: 'C',
        68: 'D',
        69: 'E',
        70: 'F',
        71: 'G',
        72: 'H',
        73: 'I',
        74: 'J',
        75: 'K',
        76: 'L',
        77: 'M',
        78: 'N',
        79: 'O',
        80: 'P',
        81: 'Q',
        82: 'R',
        83: 'S',
        84: 'T',
        85: 'U',
        86: 'V',
        87: 'W',
        88: 'X',
        89: 'Y',
        90: 'Z',
        91: 'Cmd',
        144: 'NumLock'
    },

    //Get the key-info, please note that on Mac Osx we'll convert the
    //'CMD' key to a Ctrl key!!
    info: function(e) {
        var info = new KeyInfo();

        info.pressed = Keys._keys[e.which];

        if (e.ctrlKey || e.metaKey) {
            info.modifiers.push(Keys._keys[17]);
        }

        if (e.shiftKey) {
            info.modifiers.push(Keys._keys[16]);
        }

        if (e.altKey) {
            info.modifiers.push(Keys._keys[18]);
        }

        return info;
    }
};

window.Keys = Keys;