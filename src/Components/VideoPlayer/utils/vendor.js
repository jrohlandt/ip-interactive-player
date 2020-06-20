import { VENDORS } from '../Constants';
function getVendor(url) {

  if (/\.mp4$/.test(url)) {
    return VENDORS.HTML5;
  }

  const re = new RegExp(/^((https?:)?\/\/)?(www\.)?(youtube\.com|youtu.be)/);
  if (re.test(url)) {
    return VENDORS.YOUTUBE;
  }

  const vimeo = new RegExp(/^((https?:)?\/\/)?(www\.)?vimeo\.com/);
  if (vimeo.test(url)) {
    return VENDORS.VIMEO;
  }

  return null;
}

function getYoutubeVideoId(url) {

  if (getVendor(url) !== VENDORS.YOUTUBE) {
    return null;
  }

  // handle youtu.be
  const re1 = /((https?:)?\/\/)?youtu.be\/?/;
  if (re1.test(url)) {
    url = url.replace(re1, '').replace(/&s=[0-9]+/, '');
    return url;
  }

  const re = /v=[a-zA-Z0-9_-]+/; // only matches from "v="" up to and before "&" in "https://www.youtube.com/watch?v=w6YLj12s1e4&s=18"
  const results = url.match(re);
  // console.log(results);
  return results !== null ? results[0].replace('v=', '') : null;
}

function getVimeoVideoId(url) {

  return url.replace(/(https?:\/\/|\/\/)/, '')
    .replace(/(vimeo.com\/|player.vimeo.com\/video\/)/i, '')
    .replace(/\/.*/, '');
}

export { getVendor, getYoutubeVideoId, getVimeoVideoId };