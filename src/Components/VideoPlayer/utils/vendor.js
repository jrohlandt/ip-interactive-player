function getVendor(url) {
    if (url.trim().indexOf('.mp4') !== -1) {
      return 'HTML5';
    } else {
      return 'YOUTUBE'; // todo definitely improve this function
    }
}

function getYoutubeVideoId(url) {
    // https://www.youtube.com/watch?v=w6YLj12s1e4
    // todo still needs to handle more cases
    // e.g.     // https://www.youtube.com/watch?v=w6YLj12s1e4&s=18
    // e.g. // https://youtu.be?v=w6YLj12s1e4&s=18
    return url.replace(/(https?:\/\/|\/\/)/, '')
            .replace(/www.youtube.com\/watch\?v=/, '');
}

function getVimeoVideoId(url) {

    return url.replace(/(https?:\/\/|\/\/)/, '')
                .replace(/(vimeo.com\/|player.vimeo.com\/video\/)/i, '')
                .replace(/\/.*/, '');
}

export { getVendor, getYoutubeVideoId, getVimeoVideoId };