const nodemailer = require('nodemailer');

const extractTimeFormat = () => {
  const curr = new Date();
  const utc = curr.getTime()
  const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
  const timeDate = new Date(utc + KR_TIME_DIFF);
  return {
    time: `${timeDate.getUTCHours()}-${timeDate.getMinutes()}`,
    date: timeDate.toISOString().split('T')[0]
  }
}

const mailService = async (buffers) => {
  const { time, date } = extractTimeFormat()
  const totalTimeString = `${date}_${time}`
  const transporter = nodemailer.createTransport({
    service: 'gmail',   // 메일 보내는 곳
    prot: 587,
    host: 'smtp.gmlail.com',  
    secure: false,  
    auth: {
      user: process.env.ROBOT_SENDER_EMAIL,  // 보내는 메일의 주소
      pass: process.env.ROBOT_SENDER_PASSWORD  // 보내는 메일의 비밀번호
    }
  });
  console.log(process.env.ROBOT_SENDER_EMAIL)

  // 메일 옵션
  const mailOptions = {
    from: process.env.ROBOT_SENDER_EMAIL, // 보내는 메일의 주소
    to: process.env.RECIEVE_EMAIL, // 수신할 이메일
    subject: "Qualtrics 봇 크롤링 결과", // 메일 제목
    text: `${totalTimeString} 시간대 크롤링 결과.`, // 메일 내용
    html: `${totalTimeString} 시간대 크롤링 결과.`,
    attachments: [
      {
        filename: `${totalTimeString}.xlsx`,
        content: buffers,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    ]
  };
  const res = await transporter.sendMail(mailOptions);
  console.log(`Email Send compelted ${res.response}`)
}

exports.mailService = mailService