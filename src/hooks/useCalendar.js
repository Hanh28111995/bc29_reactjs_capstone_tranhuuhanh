import { useState } from 'react';
import { isEqual } from 'constants/common';



const daysShortArr = [
  'CN', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'
];

const monthNamesArr = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];
const useCalendar = (daysShort = daysShortArr, monthNames = monthNamesArr) => {
  const [backup, setbackup] = useState([]);

  const today = new Date();
  const todayFormatted = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
  const daysInWeek = [0, 1, 2, 3, 4, 5, 6];

  const [selectedDate, setSelectedDate] = useState(today);

  const selectedMonthLastDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const prevMonthLastDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 0);
  const daysInMonth = selectedMonthLastDate.getDate();
  const firstDayInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
  const startingPoint = daysInWeek.indexOf(firstDayInMonth) + 1;
  let prevMonthStartingPoint = prevMonthLastDate.getDate() - daysInWeek.indexOf(firstDayInMonth) + 1;
  let currentMonthCounter = 1;
  let nextMonthCounter = 1;
  const rows = 5;
  const cols = 7;
  const calendarRows = {};
  let render_array_today = [];

  for (let i = 1; i < rows + 1; i++) {
    for (let j = 1; j < cols + 1; j++) {
      if (!calendarRows[i]) {
        calendarRows[i] = [];
      }

      if (i === 1) {
        if (j < startingPoint) {
          calendarRows[i] = [...calendarRows[i], {
            classes: 'in-prev-month',
            date: `${prevMonthStartingPoint}-${selectedDate.getMonth() === 0 ? 12 : selectedDate.getMonth()}-${selectedDate.getMonth() === 0 ? selectedDate.getFullYear() - 1 : selectedDate.getFullYear()}`,
            value: prevMonthStartingPoint
          }];
          prevMonthStartingPoint++;
        } else {
          calendarRows[i] = [...calendarRows[i], {
            classes: '',
            date: `${currentMonthCounter}-${selectedDate.getMonth() + 1}-${selectedDate.getFullYear()}`,
            value: currentMonthCounter
          }];
          currentMonthCounter++;
        }
      } else if (i > 1 && currentMonthCounter < daysInMonth + 1) {
        calendarRows[i] = [...calendarRows[i], {
          classes: '',
          date: `${currentMonthCounter}-${selectedDate.getMonth() + 1}-${selectedDate.getFullYear()}`,
          value: currentMonthCounter
        }];
        currentMonthCounter++;
      } else {
        calendarRows[i] = [...calendarRows[i], {
          classes: 'in-next-month',
          date: `${nextMonthCounter}-${selectedDate.getMonth() + 2 === 13 ? 1 : selectedDate.getMonth() + 2}-${selectedDate.getMonth() + 2 === 13 ? selectedDate.getFullYear() + 1 : selectedDate.getFullYear()}`,
          value: nextMonthCounter
        }];
        nextMonthCounter++;
      }
    }
  }
  //// lọc lấy gái trị date trong ogject gốc
  const render_array = Object.values(calendarRows).map((cols) => {
    return cols.map(col => {
      return col.date
    })
  })
  //// giá trị lọc đc sẽ đc tham chiếu để tìm vị trí today, từ đó xuất ra mảng chứa 3 rows trong đo today trong rows[0]
  // console.log(render_array)
  if ((render_array)
    && (backup.length === 0)
  ) {
    for (let i = 0; i < render_array.length; i++) {
      for (let y = 0; y < (render_array[i]).length; y++) {
        if (todayFormatted === render_array[i][y]) {
          render_array_today = Object.values(calendarRows).splice(i, 3);
          if ((render_array_today.length < 3) && (render_array_today !== [])) {
            setbackup(render_array_today);
            setSelectedDate(prevValue => new Date(prevValue.getFullYear(), prevValue.getMonth() + 1, 1));
          }
        }
      }
    }
    if (render_array_today.length === 0) {
      setSelectedDate(prevValue => new Date(prevValue.getFullYear(), prevValue.getMonth() + 1, 1));
    }
  }

  if (backup.length !== 0) {
    if ((todayFormatted[0] === '1') && (todayFormatted[1] === '-')) {
      setbackup([]);
    }
    else {
      for (let i = 0; i < backup.length; i++) {
        for (let y = 0; y < (backup[i]).length; y++) {
          if (todayFormatted === (backup[i][y]).date) {
            render_array_today = Object.values(backup).splice(i, 3);
          }
        }
      }
      const date_calendarRow = Object.values(calendarRows).map(ele => {
        return ele.map(col => {
          return col.date
        })
      })

      const date_render_array_today = Object.values(render_array_today).map(ele => {
        return ele.map(col => {
          return col.date
        })
      })
      // console.log(date_render_array_today[0], date_calendarRow[0])

      if (isEqual(date_render_array_today[0], date_calendarRow[0])) {
        render_array_today = [];
        for (let y = 1; y < 4; y++) {
          render_array_today.push(calendarRows[y]);
        }

      }
      // console.log(date_render_array_today[1], date_calendarRow[0])

      if (date_render_array_today[1] !== undefined)
        if (isEqual(date_render_array_today[1], date_calendarRow[0])) {
          render_array_today.push(calendarRows[2]);
        }
    }
  }


  // console.log(!backup)



  ////////// trường hợp today rơi cào cuối tháng, khiến mảng rows không đủ 3 hàng

  // console.log(render_array_today)

  const getPrevMonth = () => {
    setSelectedDate(prevValue => new Date(prevValue.getFullYear(), prevValue.getMonth() - 1, 1));
  }

  const getNextMonth = () => {
    setSelectedDate(prevValue => new Date(prevValue.getFullYear(), prevValue.getMonth() + 1, 1));
  }

  return {
    today,
    daysShort,
    monthNames,
    todayFormatted,
    calendarRows,
    selectedDate,
    getPrevMonth,
    getNextMonth,
    render_array_today,
  }
}

export default useCalendar;