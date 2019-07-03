function getVimeoVideoId(url) {

    return url.replace(/(https?:\/\/|\/\/)/, '')
                .replace(/(vimeo.com\/|player.vimeo.com\/video\/)/i, '')
                .replace(/\/.*/, '');
}

export { getYoutubeVideoId, getVimeoVideoId };