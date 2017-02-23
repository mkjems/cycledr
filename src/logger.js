export const logArgs = () => {
console.log( '...................................');
    [...arguments].map(arg => {
        console.log('*', arg);
    });
};

export const logObj = (obj, title='') => {
    console.log( '+++++++++++++++'+title+'++++++++++++++++++');
    for (var key in obj) {
        console.log( key, obj[key]);
    }
};

export const logArr = (Arr, title='') => {
    console.log( '---------------'+title+'-------------------');
    arr.map(val => {
        console.log(char + ' ' + val);
    });
};
