const nodemailer = require('nodemailer');

const mailService = async (buffers) => {
  const timeInfo = `2022-02-22_17-00`
  const transporter = nodemailer.createTransport({
    service: 'gmail',   // 메일 보내는 곳
    prot: 587,
    host: 'smtp.gmlail.com',  
    secure: false,  
    requireTLS: true ,
    auth: {
      user: process.env.ROBOT_SENDER_EMAIL,  // 보내는 메일의 주소
      pass: process.env.ROBOT_SENDER_PASSWORD  // 보내는 메일의 비밀번호
    }
  });

  // 메일 옵션
  const mailOptions = {
    from: process.env.ROBOT_SENDER_EMAIL, // 보내는 메일의 주소
    to: process.env.RECIEVE_EMAIL, // 수신할 이메일
    subject: "Qualtrics 봇 크롤링 결과", // 메일 제목
    text: `${timeInfo} 시간대 크롤링 결과.`, // 메일 내용
    html: 'content',
    attachments: [
      {
        filename: `${timeInfo}.xlsx`,
        content: buffers,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    ]
  };
  const res = await transporter.sendMail(mailOptions);
  console.log(`Email Send compelted ${res.response}`)
}

exports.mailService = mailService