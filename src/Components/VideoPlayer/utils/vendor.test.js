import { getVendor, getYoutubeVideoId } from './vendor';
import { VENDORS } from '../Constants';
test('it gets the vendor name from url', () => {

    expect(getVendor('https://example.com/video.mp4')).toBe(VENDORS.HTML5);
    expect(getVendor('https://example.com/video.mp4/someother.html')).toBe(null);
    
    expect(getVendor('https://youtube.com/watch/?v=abc')).toBe(VENDORS.YOUTUBE);
    expect(getVendor('youtube.com/watch/?v=abc')).toBe(VENDORS.YOUTUBE);    
    expect(getVendor('//youtube.com/watch/?v=abc')).toBe(VENDORS.YOUTUBE);    
    expect(getVendor('youtube/?watch=abc')).toBe(null);    
      
    expect(getVendor('https://youtu.be/?v=abc')).toBe(VENDORS.YOUTUBE);
    expect(getVendor('youtu.be/?v=abc')).toBe(VENDORS.YOUTUBE);
    expect(getVendor('//youtu.be/?v=abc')).toBe(VENDORS.YOUTUBE);
});

test('it gets the youtube video id from url', () => {
    expect(getYoutubeVideoId('https://youtube.com/watch/?v=abc12345678'))
        .toBe('abc12345678');

    expect(getYoutubeVideoId('youtube.com/watch/?v=abc12345678'))
        .toBe('abc12345678');

    expect(getYoutubeVideoId('youtu.be/abc12345678'))
        .toBe('abc12345678');

    expect(getYoutubeVideoId('https://example.com/youtube.com/')).toBe(null);

    expect(getYoutubeVideoId('https://example.com/youtu.be/')).toBe(null);
    
    expect(getYoutubeVideoId('https://youtube.com/watch/?v=abc12345_RXz678'))
        .toBe('abc12345_RXz678');

    expect(getYoutubeVideoId('https://youtube.com/watch/?v=abc12345-RXz678'))
        .toBe('abc12345-RXz678');

    expect(getYoutubeVideoId('https://youtube.com/watch/?v=abc1-2345-RXz-678'))
        .toBe('abc1-2345-RXz-678');

    expect(getYoutubeVideoId('https://youtube.com/watch/?v=abc1_2345_RXz_678&s=456'))
        .toBe('abc1_2345_RXz_678');

    expect(getYoutubeVideoId('https://youtube.com/watch/?v=abc1_2345-RXz_678-12'))
        .toBe('abc1_2345-RXz_678-12');

    expect(getYoutubeVideoId('https://www.youtube.com/watch/?v=abc1_2345-RXz_678-12'))
        .toBe('abc1_2345-RXz_678-12');

    expect(getYoutubeVideoId('https://youtu.be/pYv7nqMF8vk'))
        .toBe('pYv7nqMF8vk');

    expect(getYoutubeVideoId('https://youtu.be/pYv7nqMF8vk&s=18'))
        .toBe('pYv7nqMF8vk');

    expect(getYoutubeVideoId('https://www.youtube.com/watch?v=w6YLj12s1e4&s=18'))
        .toBe('w6YLj12s1e4');
        
});