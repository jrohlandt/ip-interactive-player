export const isDev = function() {
    return process.env.NODE_ENV === 'development';
}

export const isProduction = function() {
    return process.env.NODE_ENV === 'production';
}