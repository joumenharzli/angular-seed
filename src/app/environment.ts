/* 
    dont change anything in this file
*/
const currentMode = '%REPLACEME%';

export const isProduction = () => {
    return (currentMode.includes('prod'));
};

export const isDevelopment = () => {
    return !isProduction();
};
