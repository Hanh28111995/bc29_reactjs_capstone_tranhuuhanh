export const TOKEN_CYBERSOFT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5Mb3AiOiJCb290Y2FtcCAyOSIsIkhldEhhblN0cmluZyI6IjE5LzAxLzIwMjMiLCJIZXRIYW5UaW1lIjoiMTY3NDA4NjQwMDAwMCIsIm5iZiI6MTY0NTk4MTIwMCwiZXhwIjoxNjc0MjM0MDAwfQ.YESwad1hPeFZLi1alQUINpqBwiG-eLBBTADYwGZBfQc';

export const BASE_URL ='https://movienew.cybersoft.edu.vn/api';
export const USER_INFO_KEY = "USER_INFO_KEY";
export const GROUP_ID = 'GP02';
export const HOUR = ["09:00:00","12:00:00","15:00:00","18:00:00","21:00:00"];
export const banner_theater = ['http://codienlanh.com/wp-content/uploads/2018/08/z956243662384_d93c08ef99c98bbfff72d797dee26919-1024x778.jpg',
'https://cafefcdn.com/thumb_w/650/203337114487263232/2022/6/27/photo1656323960029-1656323961697468219282.jpg',
'https://reviewphimaz.com/wp-content/uploads/2018/08/rap-chieu-phim-cinestar-hai-ba-trung-tphcm.jpg',
'https://api.citypassguide.com/media/destination/galaxy-cinema-galaxy-cinema-ho-chi-minh-city.jpg.1758x854_q85_crop.jpg',
'https://www.wheretovietnam.com/wp-content/uploads/Mega-4-1.jpg',
'https://img.timviecparttime.net/2019/08/lotte-cinema-tuyen-dung-part-time-2019-can-nhac-loi-hai-khi-nop-cv-6.jpg',
]
function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g, " ");
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
    return str;
  }

  const isEqual = (obj1, obj2) => {
    const objKey1 = Object.keys(obj1);
    const objKey2 = Object.keys(obj2);
    if (objKey1.length !== objKey2.length) { return false }
    for (let ojbKey of objKey1) {
      if (obj1[ojbKey] !== obj2[ojbKey]) { return false }
    }
    return true
  }

  export { removeVietnameseTones, isEqual }; 