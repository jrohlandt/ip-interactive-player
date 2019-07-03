function getYoutubeVideoId(url) {
    // https://www.youtube.com/watch?v=w6YLj12s1e4
    // todo still needs to handle more cases
    // e.g.     // https://www.youtube.com/watch?v=w6YLj12s1e4&s=18
    return url.replace(/(https?:\/\/|\/\/)/, '')
            .replace(/www.youtube.com\/watch\?v=/, '');
}