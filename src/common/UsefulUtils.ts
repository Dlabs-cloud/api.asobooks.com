export function zeroFills(numberVal, width) {
    width = width -= numberVal.toString().length;

    if (width > 0) {
        return new Array(width + (/\./.test(numberVal) ? 2 : 1)).join('0') + numberVal;
    }

    return numberVal + '';
}

export function isEmail(email): boolean {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

