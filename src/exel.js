const Excel = require('exceljs');
const { CONSTANTS } = require('./common');

const excelGenerator = async (result) => {
    const workbook = new Excel.Workbook();
    const colums = [
        {header: 'Survey Name', key: 'surveyName'},
        {header: 'Submit Date', key: 'submitDate'},
        {header: 'Department', key: 'department'},
        {header: 'Phone Number', key: 'cellNum'},
    ];

    const sliceData = {
        surveyName: '-',
        submitDate: '-',
        department: '-',
        cellNum: '-',
    }

    for(const eachHospital of result) {
        
        const hospitalName = eachHospital.name;
        console.log(hospitalName)
        const worksheet = workbook.addWorksheet(hospitalName)
        worksheet.columns = colums
        for(const eachSurvey of eachHospital.survey) {
            const validParticipantsList = eachSurvey.participants.filter(e => e.success === true)
            console.log(`Survey Name    ${eachSurvey.surveyName}    Enough[${eachSurvey.enoughParticipants}]    valid people [${validParticipantsList.length}]    Total people [${eachSurvey.participants.length}]`)
            
            if(eachSurvey.enoughParticipants && validParticipantsList.length >= CONSTANTS.RESPONSE_FILTER_COUNT) {
                const surveyName = eachSurvey.surveyName
                for(const eachParticipants of eachSurvey.participants) {
                    worksheet.addRow({
                        surveyName,
                        submitDate: eachParticipants.date,
                        department: eachParticipants.dept,
                        cellNum: eachParticipants.cellNum,
                    });
                }
                worksheet.addRow(sliceData);
            }
        }
    }
    
    return await workbook.xlsx.writeBuffer();
}

exports.excelGenerator = excelGenerator
