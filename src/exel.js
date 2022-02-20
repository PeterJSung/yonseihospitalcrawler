const excelGenerator = async (result) => {

    // TODO:: create excel format
    let workbook = new Excel.Workbook();
    let worksheet = workbook.addWorksheet('Debtors')
    worksheet.columns = [
        {header: 'First Name', key: 'firstName'},
        {header: 'Last Name', key: 'lastName'},
        {header: 'Purchase Price', key: 'purchasePrice'},
        {header: 'Payments Made', key: 'paymentsMade'},
    ];
    let data = [
        {
            firstName: 'John',
            lastName: 'Bailey',
            purchasePrice: 1000,
            paymentsMade: 100,
        },
        {
            firstName: 'Leonard',
            lastName: 'Clark',
            purchasePrice: 1000,
            paymentsMade: 150,
        },
    ];
    data.forEach((e) => {
        worksheet.addRow(e);
    });
    
    return await workbook.xlsx.writeBuffer();
}

exports.excelGenerator = excelGenerator
